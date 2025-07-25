export enum AppointmentServiceType {
  PERSONAL = 'personal',
  // Personal care
  HAIRCUT = 'haircut',
  HAIR_COLOR = 'hair coloring',
  HAIR_TREATMENT = 'hair treatment',
  BEARD_TRIM = 'beard trim',
  FACIAL = 'facial cleansing',
  MAKEUP = 'makeup',
  MANICURE = 'manicure',
  PEDICURE = 'pedicure',
  EYEBROWS = 'eyebrows and lashes',
  WAXING = 'waxing',
  MASSAGE = 'relaxing massage',

  // Health and wellness
  MEDICAL_URGENCY = 'medical urgency',
  MEDICAL_APPOINTMENT = 'medical appointment',
  PHYSIOTHERAPY = 'physiotherapy',
  THERAPY_SESSION = 'therapy session',
  DENTAL_APPOINTMENT = 'dentist appointment',
  NUTRITIONIST = 'nutritionist',

  // Fitness and sports
  GYM_SESSION = 'gym workout',
  YOGA_CLASS = 'yoga class',
  PILATES_CLASS = 'pilates class',
  BOXING_CLASS = 'boxing class',
  SWIMMING = 'swimming session',
  PERSONAL_TRAINING = 'personal training',

  // Food and restaurants
  RESTAURANT_BOOKING = 'restaurant reservation',
  TAKEAWAY = 'takeaway order',
  CATERING = 'catering service',
  PRIVATE_DINNER = 'private dinner',
  WINE_TASTING = 'wine tasting',

  // Lifestyle
  TATTOO = 'tattoo',
  PIERCING = 'piercing',
  LANGUAGE_CLASS = 'language class',
  MUSIC_LESSON = 'music lesson',
  DANCE_CLASS = 'dance class',
  COACHING = 'coaching session',
}

export enum AppointmentState {
  REQUESTED = 'requested',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  STANDBY = 'standby',
}

export enum LocationServiceType {
  // Personal care
  HAIRCUT = 'haircut',
  HAIR_COLOR = 'hair coloring',
  HAIR_TREATMENT = 'hair treatment',
  BEARD_TRIM = 'beard trim',
  FACIAL = 'facial cleansing',
  MAKEUP = 'makeup',
  MANICURE = 'manicure',
  PEDICURE = 'pedicure',
  EYEBROWS = 'eyebrows and lashes',
  WAXING = 'waxing',
  MASSAGE = 'relaxing massage',

  // Health and wellness
  MEDICAL_URGENCY = 'medical urgency',
  MEDICAL_APPOINTMENT = 'medical appointment',
  PHYSIOTHERAPY = 'physiotherapy',
  THERAPY_SESSION = 'therapy session',
  DENTAL_APPOINTMENT = 'dentist appointment',
  NUTRITIONIST = 'nutritionist',

  // Fitness and sports
  GYM_SESSION = 'gym workout',
  YOGA_CLASS = 'yoga class',
  PILATES_CLASS = 'pilates class',
  BOXING_CLASS = 'boxing class',
  SWIMMING = 'swimming session',
  PERSONAL_TRAINING = 'personal training',

  // Food and restaurants
  RESTAURANT_BOOKING = 'restaurant reservation',
  TAKEAWAY = 'takeaway order',
  CATERING = 'catering service',
  PRIVATE_DINNER = 'private dinner',
  WINE_TASTING = 'wine tasting',

  // Lifestyle
  TATTOO = 'tattoo',
  PIERCING = 'piercing',
  LANGUAGE_CLASS = 'language class',
  MUSIC_LESSON = 'music lesson',
  DANCE_CLASS = 'dance class',
  COACHING = 'coaching session',
}


export enum LocationSchedule {
    MONDAY = 'monday',
    TUESDAY = 'tuesday',
    WEDNESDAY = 'wednesday',
    THURSDAY = 'thursday',
    FRIDAY = 'friday',
    SATURDAY = 'saturday',
    SUNDAY = 'sunday',
}

export enum ChatUserType {
    WORKER = 'worker',
    USER = 'user',
    LOCATION = 'location',
    BUSINESS = 'business',
}