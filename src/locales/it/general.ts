export const general = {
  login: {
    title: "Anmelden",
    description: "Greife auf dein Konto zu",
    form: {
      username: "Benutzername",
      password: "Passwort",
      submit: "Anmelden",
      loading: "Lädt...",
    },
    forgot_password: "Passwort vergessen?",
    signup: {
      title: "Registrieren",
      description:
        "Dies ist eine Demoseite für https://github.com/kitloong/nextjs-dashboard. Klicke auf „Login“, um die vollständige Dashboard-Vorschau zu sehen.",
    },
    message: {
      auth_failed: "Ungültiger Benutzername oder Passwort",
    },
  },

  pagination: {
    summary: "Zeige {{from}} bis {{to}} von {{total}} Ergebnissen",
    rows_per_page: "Zeilen pro Seite",
  },

  signup: {
    title: "Registrieren",
    description: "Erstelle dein Konto",
    register_now: "Jetzt registrieren!",
    form: {
      username: "Benutzername",
      email: "E-Mail",
      password: "Passwort",
      confirm_password: "Passwort bestätigen",
      submit: "Konto erstellen",
    },
  },

  action: {
    info: "Information",
    edit: "Bearbeiten",
    delete: "Löschen",
    submit: "Senden",
    submitting: "Senden...",
    reset: "Zurücksetzen",
  },

  theme: {
    light: "Hell",
    dark: "Dunkel",
    auto: "Automatisch",
  },

  dashboard: {
    featured: {
      user: "Benutzer",
      income: "Einnahmen",
      conversion_rate: "Konversionsrate",
      sessions: "Sitzungen",
      action: {
        action1: "Aktion",
        action2: "Weitere Aktion",
        action3: "Etwas anderes",
      },
    },

    traffic: {
      title: "Traffic",
      duration: "Januar – Juli 2021",
      option: {
        day: "Tag",
        month: "Monat",
        year: "Jahr",
      },
      chart: {
        xlabel1: "Januar",
        xlabel2: "Februar",
        xlabel3: "März",
        xlabel4: "April",
        xlabel5: "Mai",
        xlabel6: "Juni",
        xlabel7: "Juli",
      },
      users: "Benutzer",
      views: "Aufrufe",
      category1: "Besuche",
      category2: "Eindeutige",
      category3: "Seitenaufrufe",
      category4: "Neue Benutzer",
      category5: "Absprungrate",
    },

    sales: {
      title: "Traffic und Verkäufe",
      stats: {
        stat1: "Neue Kunden",
        stat2: "Wiederkehrende Kunden",
        stat3: "Seitenaufrufe",
        stat4: "Organisch",
      },
      monday: "Montag",
      tuesday: "Dienstag",
      wednesday: "Mittwoch",
      thursday: "Donnerstag",
      friday: "Freitag",
      saturday: "Samstag",
      sunday: "Sonntag",
      male: "Männlich",
      female: "Weiblich",
      organic: "Organische Suche",
      facebook: "Facebook",
      twitter: "Twitter",
      linkedin: "LinkedIn",
    },

    listing: {
      headers: {
        header1: "Benutzer",
        header2: "Nutzung",
        header3: "Zahlungsmethode",
        header4: "Aktivität",
      },
      user_status: {
        new: "Neu",
        recurring: "Wiederkehrend",
      },
      registered: "Registriert",
      last_login: "Letzte Anmeldung",
      usage_duration: "11. Jun 2020 – 10. Jul 2020",
      registered_at: "1. Jan 2020",
      items: {
        item1: { name: "Yiorgos Avraamu", login_at: "Vor 10 Sek." },
        item2: { name: "Avram Tarasios", login_at: "Vor 5 Min." },
        item3: { name: "Quintin Ed", login_at: "Vor 1 Std." },
        item4: { name: "Enéas Kwadwo", login_at: "Letzten Monat" },
        item5: { name: "Agapetus Tadeáš", login_at: "Letzte Woche" },
        item6: { name: "Friderik Dávid", login_at: "Gestern" },
      },
    },
  },

  pokemons: {
    title: "Pokémon",
    add_new: "Neu hinzufügen",
    attribute: {
      name: "Name",
      type: "Typ",
      egg_group: "Ei-Gruppe",
      hp: "HP",
      attack: "Angriff",
      defense: "Verteidigung",
      sp_attack: "Spezialangriff",
      sp_defense: "Spezialverteidigung",
      speed: "Geschwindigkeit",
      total: "Gesamt",
    },
  },

  featured_nav: {
    dashboard: "Dashboard",
    users: "Benutzer",
    settings: "Einstellungen",
  },

  notification: {
    message: "Du hast {{total}} Benachrichtigungen",
    items: {
      new_user: "Neuer Benutzer registriert",
      deleted_user: "Benutzer gelöscht",
      sales_report: "Verkaufsbericht bereit",
      new_client: "Neuer Kunde",
      server_overloaded: "Server überlastet",
    },
    server: {
      title: "Server",
      processes: "Prozesse",
      cores: "Kerne",
      items: {
        cpu: "CPU-Auslastung",
        memory: "Speicherauslastung",
        ssd1: "SSD-1-Auslastung",
      },
    },
  },

  task: {
    message: "Du hast {{total}} Aufgaben offen",
    items: {
      task1: "Next.js aktualisieren",
      task2: "Pokémon trainieren",
      task3: "Pokédex vervollständigen",
      task4: "Alle Shiny fangen",
      task5: "Alle Arenen gewinnen",
    },
    view_all: "Alle Aufgaben ansehen",
  },

  messages: {
    message: "Du hast {{total}} Nachrichten",
    items: {
      item1: {
        user: "John Doe",
        time: "Jetzt",
        title: "Haustier-Pikachu",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt",
      },
      item2: {
        user: "John Doe",
        time: "Vor 5 Min.",
        title: "Eevee ankleiden",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt",
      },
      item3: {
        user: "John Doe",
        time: "13:52",
        title: "Team-Training",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt",
      },
      item4: {
        user: "John Doe",
        time: "16:03",
        title: "Zur Safari-Zone gehen",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt",
      },
    },
  },

  profile: {
    account: {
      title: "Konto",
      items: {
        updates: "Updates",
        messages: "Nachrichten",
        tasks: "Aufgaben",
        comments: "Kommentare",
      },
    },
    settings: {
      title: "Einstellungen",
      items: {
        profile: "Profil",
        settings: "Einstellungen",
        payments: "Zahlungen",
        projects: "Projekte",
      },
    },
    lock_account: "Konto sperren",
    logout: "Abmelden",
  },

  breadcrumb: {
    home: "Startseite",
    library: "Bibliothek",
    data: "Daten",
  },
};
