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
  Text,
} from "@mantine/core";
import { LocationServiceType } from "@/types/enums";
import styles from "./LocationsFilter.module.css";
import { BusinessCard } from "./BusinessCard";

interface LocationsFilterProps {
  onLocationsChange: (locations: LocationMarker[]) => void;
}

export default function LocationsFilter({ onLocationsChange }: LocationsFilterProps) {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<"todos" | "favoritos">("todos");
  const [selectedTypes, setSelectedTypes] = useState<LocationServiceType[]>([]);
  const [searchCityText, setSearchCityText] = useState<string>("");
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [cities, setSelectedCities] = useState<string[]>([]);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [ratingMin, setMinRating] = useState<number>(0);
  const [maxDistance, setMaxDistance] = useState<number>(0);
  const [results, setResults] = useState<IBusiness[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [showDistance, setShowDistance] = useState(false);

  
  const getTodayDayString = (): string => {
  return new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
};

  const serviceOptions = Object.values(LocationServiceType).map((value) => ({
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

  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

    useEffect(() => {
    navigator.geolocation.getCurrentPosition(
        (position) => {
        setCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
        });
        },
        (err) => {
        console.warn("No se pudo obtener ubicación:", err);
        }
    );
    }, []);

  const handleFilter = async () => {
    if (!user?._id) {
      setError("User not authenticated");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const appliedFilters: FilterOptions = {
        ...(selectedTypes.length > 0 && { serviceTypes: selectedTypes }),
        ...(cities.length > 0 && { cities }),
        ...(selectedTime && { time: selectedTime }),
        ...(ratingMin > 0 && { ratingMin }),
        ...(maxDistance > 0 && { maxDistance }),
        ...(coords && !isNaN(coords.lat) && !isNaN(coords.lon) && {
            lat: coords.lat,
            lon: coords.lon,
        }),
        ...(selectedTime && { day: selectedDay ?? getTodayDayString() }), // sólo envía 'day' si se elige hora
      };

      console.log("Applied filters:", appliedFilters);

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
    {/* Botones de tabs */}
    <div className={styles.filterToggleButtons}>
      <Button
        variant={activeTab === "todos" ? "filled" : "outline"}
        onClick={() => setActiveTab("todos")}
        color={activeTab === "todos" ? "primary" : "secondary"}
      >
        Todos
      </Button>
      <Button
        variant={activeTab === "favoritos" ? "filled" : "outline"}
        onClick={() => setActiveTab("favoritos")}
        color={activeTab === "todos" ? "primary" : "secondary"}
      >
        Favoritos
      </Button>
    </div>

    {/* Filtros en una sola fila */}
    <div className={styles.filtersRow}>

      {/* Filtro tipo de servicio */}
      <Menu shadow="md" width={260}>
        <Menu.Target>
          <Button
            variant={selectedTypes.length > 0 ? "filled" : "outline"}
            color={selectedTypes.length > 0 ? "primary" : "secondary"} 
          >
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
                color="primary"
              />
            ))}
          </ScrollArea>
        </Menu.Dropdown>
      </Menu>

      {/* Filtro ciudad */}
      <Menu shadow="md" width={260}>
        <Menu.Target>
          <Button
            variant={cities.length > 0 ? "filled" : "outline"}
            color={cities.length > 0 ? "primary" : "secondary"}
          >
            Ciudad
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <div className={styles.citySearchWrapper}>
            <input
              type="text"
              value={searchCityText}
              onChange={(e) => setSearchCityText(e.target.value)}
              placeholder="Buscar ciudad..."
              className={styles.cityInput}
            />
            <ScrollArea className={styles.citySuggestions}>
              {citySuggestions.map((city) => (
                <Text
                  key={city}
                  onClick={() => {
                    if (!cities.includes(city)) {
                      setSelectedCities((prev) => [...prev, city]);
                    }
                  }}
                  className={styles.citySuggestionItem}
                  color="secondary"
                >
                  {city}
                </Text>
              ))}
            </ScrollArea>
          </div>
        </Menu.Dropdown>
      </Menu>

      {/* Filtro por hora/día */}
      <div style={{ flex: 1 }}>
        <Button
          variant={selectedTime || selectedDay ? "filled" : "outline"}
          onClick={() => setShowTimePicker((prev) => !prev)}
          color={ratingMin > 0 ? "primary" : "secondary"}
          fullWidth
        >
          {selectedTime || selectedDay
            ? `Abierto${selectedTime ? ` a ${selectedTime}` : ""}${selectedDay ? ` (${selectedDay})` : ""}`
            : "Abierto a..."}
        </Button>
        {showTimePicker && (
          <div className={styles.timeDayWrapper}>
            <input
              type="time"
              value={selectedTime ?? ""}
              onChange={(e) => setSelectedTime(e.target.value)}
              className={styles.timeInput}
            />
            <select
              value={selectedDay ?? ""}
              onChange={(e) => setSelectedDay(e.target.value || null)}
              className={styles.daySelect}
            >
              <option value="">(Hoy)</option>
              <option value="monday">Lunes</option>
              <option value="tuesday">Martes</option>
              <option value="wednesday">Miércoles</option>
              <option value="thursday">Jueves</option>
              <option value="friday">Viernes</option>
              <option value="saturday">Sábado</option>
              <option value="sunday">Domingo</option>
            </select>
          </div>
        )}
      </div>

      {/* Filtro valoración mínima */}
      <div style={{ flex: 1 }}>
        <Button
          variant={ratingMin > 0 ? "filled" : "outline"}
          color={ratingMin > 0 ? "primary" : "secondary"}
          onClick={() => setShowRating((prev) => !prev)}
          fullWidth
        >
          {ratingMin > 0 ? `Valoración mínima: ${ratingMin.toFixed(1)} ⭐` : "Valoración mínima"}
        </Button>
        {showRating && (
          <div className={styles.sliderWrapper}>
            <input
              type="range"
              min={0}
              max={5}
              step={0.1}
              value={ratingMin}
              onChange={(e) => setMinRating(parseFloat(e.target.value))}
              style={{ width: "100%" }}
            />
            <button className={styles.clearButton} onClick={() => setMinRating(0)}>
              Limpiar
            </button>
          </div>
        )}
      </div>

      {/* Filtro distancia */}
      <div style={{ flex: 1 }}>
        <Button
          variant={maxDistance > 0 ? "filled" : "outline"}
          onClick={() => setShowDistance((prev) => !prev)}
          color={maxDistance > 0 ? "primary" : "secondary"} 
          fullWidth
        >
          {maxDistance > 0 ? `Distancia máxima: ${maxDistance} km` : "Distancia máxima"}
        </Button>
        {showDistance && (
          <div className={styles.sliderWrapper}>
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
        )}
      </div>
    </div>

    {/* Ciudades seleccionadas */}
    {cities.length > 0 && (
      <div className={styles.selectedCitiesContainer}>
        {cities.map((city) => (
          <span key={city} className={styles.selectedCity}>
            {city}
            <button
              className={styles.removeCityBtn}
              onClick={() => setSelectedCities((prev) => prev.filter((c) => c !== city))}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    )}

    {/* Botón disponibilidad y buscar */}
    <Button variant="outline" color="secondary" fullWidth disabled>
      Disponibilidad (próximamente)
    </Button>

    <Button onClick={handleFilter} loading={loading} fullWidth color="primary">
      Buscar
    </Button>

    {error && <Text color="red">{error}</Text>}

    {results && results.length > 0 && (
      <ScrollArea className={styles.scrollResults}>
        {results.map((business) => (
          <BusinessCard key={business._id} business={business}></BusinessCard>
        ))}
      </ScrollArea>
    )}

    {results && results.length === 0 && !loading && (
      <Text color="secondary">No se encontraron resultados.</Text>
    )}
  </div>
);
}