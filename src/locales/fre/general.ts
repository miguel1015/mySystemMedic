export const general = {
  login: {
    title: "Se connecter",
    description: "Accédez à votre compte",
    form: {
      username: "Utilisateur",
      password: "Mot de passe",
      submit: "Se connecter",
      loading: "chargement...",
    },
    forgot_password: "Mot de passe oublié ?",
    signup: {
      title: "S'inscrire",
      description:
        'Ceci est une page de démonstration pour https://github.com/kitloong/nextjs-dashboard. Cliquez sur "Login" pour voir l’aperçu complet du tableau de bord.',
    },
    message: {
      auth_failed: "Utilisateur ou mot de passe invalide",
    },
  },

  pagination: {
    summary: "Affichage de {{from}} à {{to}} sur {{total}} résultats",
    rows_per_page: "Lignes par page",
  },

  signup: {
    title: "S'inscrire",
    description: "Créez votre compte",
    register_now: "Inscrivez-vous maintenant !",
    form: {
      username: "Utilisateur",
      email: "Email",
      password: "Mot de passe",
      confirm_password: "Confirmer le mot de passe",
      submit: "Créer un compte",
    },
  },

  action: {
    info: "Information",
    edit: "Modifier",
    delete: "Supprimer",
    submit: "Envoyer",
    submitting: "Envoi...",
    reset: "Réinitialiser",
  },

  theme: {
    light: "Clair",
    dark: "Sombre",
    auto: "Automatique",
  },

  dashboard: {
    featured: {
      user: "Utilisateurs",
      income: "Revenus",
      conversion_rate: "Taux de conversion",
      sessions: "Sessions",
      action: {
        action1: "Action",
        action2: "Autre action",
        action3: "Quelque chose de plus",
      },
    },

    traffic: {
      title: "Trafic",
      duration: "Janvier - Juillet 2021",
      option: {
        day: "Jour",
        month: "Mois",
        year: "Année",
      },
      chart: {
        xlabel1: "Janvier",
        xlabel2: "Février",
        xlabel3: "Mars",
        xlabel4: "Avril",
        xlabel5: "Mai",
        xlabel6: "Juin",
        xlabel7: "Juillet",
      },
      users: "Utilisateurs",
      views: "Vues",
      category1: "Visites",
      category2: "Uniques",
      category3: "Pages vues",
      category4: "Nouveaux utilisateurs",
      category5: "Taux de rebond",
    },

    sales: {
      title: "Trafic et Ventes",
      stats: {
        stat1: "Nouveaux clients",
        stat2: "Clients récurrents",
        stat3: "Pages vues",
        stat4: "Organique",
      },
      monday: "Lundi",
      tuesday: "Mardi",
      wednesday: "Mercredi",
      thursday: "Jeudi",
      friday: "Vendredi",
      saturday: "Samedi",
      sunday: "Dimanche",
      male: "Homme",
      female: "Femme",
      organic: "Recherche organique",
      facebook: "Facebook",
      twitter: "Twitter",
      linkedin: "LinkedIn",
    },

    listing: {
      headers: {
        header1: "Utilisateur",
        header2: "Utilisation",
        header3: "Méthode de paiement",
        header4: "Activité",
      },
      user_status: {
        new: "Nouveau",
        recurring: "Récurrent",
      },
      registered: "Enregistré",
      last_login: "Dernière connexion",
      usage_duration: "11 Juin 2020 - 10 Juil. 2020",
      registered_at: "1 Janv. 2020",

      items: {
        item1: { name: "Yiorgos Avraamu", login_at: "Il y a 10 sec" },
        item2: { name: "Avram Tarasios", login_at: "Il y a 5 min" },
        item3: { name: "Quintin Ed", login_at: "Il y a 1 heure" },
        item4: { name: "Enéas Kwadwo", login_at: "Le mois dernier" },
        item5: { name: "Agapetus Tadeáš", login_at: "La semaine dernière" },
        item6: { name: "Friderik Dávid", login_at: "Hier" },
      },
    },
  },

  pokemons: {
    title: "Pokémon",
    add_new: "Ajouter nouveau",
    attribute: {
      name: "Nom",
      type: "Type",
      egg_group: "Groupe d'œufs",
      hp: "PV",
      attack: "Attaque",
      defense: "Défense",
      sp_attack: "Attaque spé.",
      sp_defense: "Défense spé.",
      speed: "Vitesse",
      total: "Total",
    },
  },

  featured_nav: {
    dashboard: "Tableau de bord",
    users: "Utilisateurs",
    settings: "Paramètres",
  },

  notification: {
    message: "Vous avez {{total}} notifications",
    items: {
      new_user: "Nouvel utilisateur enregistré",
      deleted_user: "Utilisateur supprimé",
      sales_report: "Rapport de ventes prêt",
      new_client: "Nouveau client",
      server_overloaded: "Serveur surchargé",
    },
    server: {
      title: "Serveur",
      processes: "Processus",
      cores: "Cœurs",
      items: {
        cpu: "Utilisation CPU",
        memory: "Utilisation mémoire",
        ssd1: "Utilisation SSD 1",
      },
    },
  },

  task: {
    message: "Vous avez {{total}} tâches en attente",
    items: {
      task1: "Mettre à jour Next.JS",
      task2: "Entraîner des Pokémon",
      task3: "Compléter le Pokédex",
      task4: "Attraper tous les shiny",
      task5: "Gagner tous les gyms",
    },
    view_all: "Voir toutes les tâches",
  },

  messages: {
    message: "Vous avez {{total}} messages",
    items: {
      item1: {
        user: "John Doe",
        time: "Maintenant",
        title: "Pikachu de compagnie",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt",
      },
      item2: {
        user: "John Doe",
        time: "Il y a 5 min",
        title: "Habiller Eevee",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt",
      },
      item3: {
        user: "John Doe",
        time: "13h52",
        title: "Entraînement d'équipe",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt",
      },
      item4: {
        user: "John Doe",
        time: "16h03",
        title: "Aller au Safari Zone",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt",
      },
    },
  },

  profile: {
    account: {
      title: "Compte",
      items: {
        updates: "Mises à jour",
        messages: "Messages",
        tasks: "Tâches",
        comments: "Commentaires",
      },
    },
    settings: {
      title: "Paramètres",
      items: {
        profile: "Profil",
        settings: "Paramètres",
        payments: "Paiements",
        projects: "Projets",
      },
    },
    lock_account: "Verrouiller le compte",
    logout: "Se déconnecter",
  },

  breadcrumb: {
    home: "Accueil",
    library: "Bibliothèque",
    data: "Données",
  },
};
