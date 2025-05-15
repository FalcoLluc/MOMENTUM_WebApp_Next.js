"use client";

import { useState, useEffect } from "react";
import { businessService } from "@/services/businessService";
import { FilterOptions, IBusiness, LocationMarker } from "@/types";
import { useAuthStore } from "@/stores/authStore";
import {
  Button,
  Menu,
  Checkbox,
  ScrollArea,
  Group,
  Text,
} from "@mantine/core";
import { locationServiceType } from "@/types/enums";
import styles from "./LocationsFilter.module.css";

interface LocationsFilterProps {
  onLocationsChange: (locations: LocationMarker[]) => void;
}

export default function LocationsFilter({ onLocationsChange }: LocationsFilterProps) {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<"todos" | "favoritos">("todos");
  const [filters, setFilters] = useState<FilterOptions>({});
  const [selectedTypes, setSelectedTypes] = useState<locationServiceType[]>([]);
  const [searchCityText, setSearchCityText] = useState<string>("");
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxDistance, setMaxDistance] = useState<number>(0);
  const [results, setResults] = useState<IBusiness[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const serviceOptions = Object.values(locationServiceType).map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1),
  }));

  useEffect(() => {
    const fetchCitySuggestions = async () => {
      if (searchCityText.trim().length < 2) {
        setCitySuggestions([]);
        return;
      }

      try {
        const businesses = await businessService.searchBusinessByName(searchCityText.trim());
        if (!businesses) {
          setCitySuggestions([]);
          return;
        }

        const uniqueCities = new Set<string>();
        businesses.forEach((business) => {
          business.location?.forEach((location) => {
            const match = location.address?.match(/\d{5}\s+([^,]+)/i);
            if (match && match[1]) uniqueCities.add(match[1].trim());
          });
        });

        setCitySuggestions(Array.from(uniqueCities));
      } catch (e) {
        console.error("Error fetching city suggestions:", e);
        setCitySuggestions([]);
      }
    };

    fetchCitySuggestions();
  }, [searchCityText]);

  const handleFilter = async () => {
    if (!user?._id) {
      setError("User not authenticated");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const appliedFilters: FilterOptions = {
        ...filters,
        ...(selectedTypes.length > 0 ? { serviceTypes: selectedTypes } : {}),
        ...(selectedCities.length > 0 ? { cities: selectedCities } : {}),
        ...(selectedTime ? { time: selectedTime } : {}),
        ...(minRating > 0 ? { minRating } : {}),
        ...(maxDistance > 0 ? { maxDistance } : {}),
      };

      let data: IBusiness[] | null = null;
      if (activeTab === "todos") {
        data = await businessService.getFilteredBusinesses(appliedFilters);
      } else {
        data = await businessService.getFilteredFavoriteBusinesses(user._id, appliedFilters);
      }

      setResults(data || []);

      const markers: LocationMarker[] = (data || []).flatMap((business) =>
        business.location?.map((location) => ({
          id: location._id,
          name: location.nombre ?? business.name,
          position: [location.ubicacion.coordinates[1], location.ubicacion.coordinates[0]],
          address: location.address ?? "",
          serviceTypes: location.serviceType?.join(", ") ?? "",
          rating: location.rating ?? 0,
          phone: location.phone ?? "",
          business: business.name,
        })) || []
      );

      onLocationsChange(markers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
      setResults([]);
      onLocationsChange([]);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className={styles.container}>
    <Group className={styles.buttonGroup}>
      <Button variant={activeTab === "todos" ? "filled" : "outline"} onClick={() => setActiveTab("todos")}>Todos</Button>
      <Button variant={activeTab === "favoritos" ? "filled" : "outline"} onClick={() => setActiveTab("favoritos")}>Favoritos</Button>
    </Group>

    <Menu shadow="md" width={260}>
      <Menu.Target>
        <Button>
          {selectedTypes.length > 0
            ? `${selectedTypes.length} tipo${selectedTypes.length > 1 ? "s" : ""}`
            : "Tipos de servicio"}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <ScrollArea style={{ height: 200 }} pr="xs">
          {serviceOptions.map(({ value, label }) => (
            <Checkbox
              key={value}
              label={label}
              checked={selectedTypes.includes(value)}
              onChange={(e) => {
                const checked = e.currentTarget.checked;
                setSelectedTypes((prev) =>
                  checked ? [...prev, value] : prev.filter((t) => t !== value)
                );
              }}
              mb="xs"
            />
          ))}
        </ScrollArea>
      </Menu.Dropdown>
    </Menu>

    <Menu shadow="md" width={260}>
      <Menu.Target>
        <Button variant={selectedCities.length ? "filled" : "outline"}>
          {selectedCities.length > 0 ? selectedCities.join(', ') : 'Ciudad'}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <div style={{ padding: 8 }}>
          <input
            type="text"
            value={searchCityText}
            onChange={(e) => setSearchCityText(e.target.value)}
            placeholder="Buscar ciudad..."
            style={{ width: '100%', marginBottom: 8, padding: 4 }}
          />
          <ScrollArea className={styles.citySuggestions}>
            {citySuggestions.map((city) => (
              <Text
                key={city}
                onClick={() => {
                  if (!selectedCities.includes(city)) {
                    setSelectedCities((prev) => [...prev, city]);
                  }
                }}
                style={{ cursor: 'pointer', padding: '4px 0' }}
              >
                {city}
              </Text>
            ))}
          </ScrollArea>
        </div>
      </Menu.Dropdown>
    </Menu>

    {/* Filtro por hora */}
    <div>
      <Button
        variant={selectedTime ? "filled" : "outline"}
        onClick={() => setShowTimePicker((prev) => !prev)}
        fullWidth
      >
        {selectedTime ? `Abierto a ${selectedTime}` : "Abierto a"}
      </Button>
      {showTimePicker && (
        <input
          type="time"
          value={selectedTime ?? ""}
          onChange={(e) => setSelectedTime(e.target.value)}
          style={{ marginTop: "8px", width: "100%", padding: "8px" }}
        />
      )}
    </div>

    {/* Filtro por valoración mínima */}
    <div className={styles.sliderWrapper}>
      <Text size="sm" className={styles.sliderLabel}>
        Valoración mínima: {minRating.toFixed(1)} ⭐
      </Text>
      <input
        type="range"
        min={0}
        max={5}
        step={0.1}
        value={minRating}
        onChange={(e) => setMinRating(parseFloat(e.target.value))}
        style={{ width: "100%" }}
      />
      <button className={styles.clearButton} onClick={() => setMinRating(0)}>
        Limpiar
      </button>
    </div>

    {/* Filtro por distancia */}
    <div className={styles.sliderWrapper}>
      <Text size="sm" className={styles.sliderLabel}>
        Distancia máxima: {maxDistance} km
      </Text>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={maxDistance}
        onChange={(e) => setMaxDistance(parseInt(e.target.value))}
        style={{ width: "100%" }}
      />
      <button className={styles.clearButton} onClick={() => setMaxDistance(0)}>
        Limpiar
      </button>
    </div>

    {/* Botón de disponibilidad */}
    <Button variant="outline" color="gray" fullWidth disabled>
      Disponibilidad (próximamente)
    </Button>

    <Button onClick={handleFilter} loading={loading} fullWidth color="green">
      Buscar
    </Button>

    {error && <Text color="red">{error}</Text>}

    {results && results.length > 0 && (
      <ScrollArea className={styles.scrollResults}>
        {results.map((business) => (
          <Text key={business._id?.toString()} mb="xs">
            • {business.name}
          </Text>
        ))}
      </ScrollArea>
    )}

    {results && results.length === 0 && !loading && (
      <Text color="red">No se encontraron resultados.</Text>
    )}
  </div>
);
}