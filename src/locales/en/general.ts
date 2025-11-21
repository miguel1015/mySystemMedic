export const general = {
  login: {
    title: "Login",
    description: "Access your account",
    form: {
      username: "Username",
      password: "Password",
      submit: "Log in",
      loading: "loading...",
    },
    forgot_password: "Forgot your password?",
    signup: {
      title: "Sign up",
      description:
        'This is a demo page for https://github.com/kitloong/nextjs-dashboard. Click "Login" to see the full dashboard preview.',
    },
    message: {
      auth_failed: "Invalid username or password",
    },
  },

  pagination: {
    summary: "Showing {{from}} to {{to}} of {{total}} results",
    rows_per_page: "Rows per page",
  },

  signup: {
    title: "Register",
    description: "Create your account",
    register_now: "Register now!",
    form: {
      username: "Username",
      email: "Email",
      password: "Password",
      confirm_password: "Confirm password",
      submit: "Create account",
    },
  },

  action: {
    info: "Information",
    edit: "Edit",
    delete: "Delete",
    submit: "Submit",
    submitting: "Submitting...",
    reset: "Reset",
  },

  theme: {
    light: "Light",
    dark: "Dark",
    auto: "Auto",
  },

  dashboard: {
    featured: {
      user: "Users",
      income: "Income",
      conversion_rate: "Conversion rate",
      sessions: "Sessions",
      action: {
        action1: "Action",
        action2: "Another action",
        action3: "Something else",
      },
    },

    traffic: {
      title: "Traffic",
      duration: "January - July 2021",
      option: {
        day: "Day",
        month: "Month",
        year: "Year",
      },
      chart: {
        xlabel1: "January",
        xlabel2: "February",
        xlabel3: "March",
        xlabel4: "April",
        xlabel5: "May",
        xlabel6: "June",
        xlabel7: "July",
      },
      users: "Users",
      views: "Views",
      category1: "Visits",
      category2: "Unique",
      category3: "Page views",
      category4: "New users",
      category5: "Bounce rate",
    },

    sales: {
      title: "Traffic and Sales",
      stats: {
        stat1: "New customers",
        stat2: "Returning customers",
        stat3: "Page views",
        stat4: "Organic",
      },
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday",
      male: "Male",
      female: "Female",
      organic: "Organic search",
      facebook: "Facebook",
      twitter: "Twitter",
      linkedin: "LinkedIn",
    },

    listing: {
      headers: {
        header1: "User",
        header2: "Usage",
        header3: "Payment method",
        header4: "Activity",
      },
      user_status: {
        new: "New",
        recurring: "Recurring",
      },
      registered: "Registered",
      last_login: "Last login",
      usage_duration: "Jun 11, 2020 - Jul 10, 2020",
      registered_at: "Jan 1, 2020",

      items: {
        item1: { name: "Yiorgos Avraamu", login_at: "10 sec ago" },
        item2: { name: "Avram Tarasios", login_at: "5 min ago" },
        item3: { name: "Quintin Ed", login_at: "1 hour ago" },
        item4: { name: "Enéas Kwadwo", login_at: "Last month" },
        item5: { name: "Agapetus Tadeáš", login_at: "Last week" },
        item6: { name: "Friderik Dávid", login_at: "Yesterday" },
      },
    },
  },

  pokemons: {
    title: "Pokémon",
    add_new: "Add new",
    attribute: {
      name: "Name",
      type: "Type",
      egg_group: "Egg group",
      hp: "HP",
      attack: "Attack",
      defense: "Defense",
      sp_attack: "Sp. Attack",
      sp_defense: "Sp. Defense",
      speed: "Speed",
      total: "Total",
    },
  },

  featured_nav: {
    dashboard: "Dashboard",
    users: "Users",
    settings: "Settings",
  },

  notification: {
    message: "You have {{total}} notifications",
    items: {
      new_user: "New user registered",
      deleted_user: "User deleted",
      sales_report: "Sales report ready",
      new_client: "New client",
      server_overloaded: "Server overloaded",
    },
    server: {
      title: "Server",
      processes: "Processes",
      cores: "Cores",
      items: {
        cpu: "CPU usage",
        memory: "Memory usage",
        ssd1: "SSD 1 usage",
      },
    },
  },

  task: {
    message: "You have {{total}} pending tasks",
    items: {
      task1: "Update Next.JS",
      task2: "Train Pokémon",
      task3: "Complete Pokédex",
      task4: "Catch all shinies",
      task5: "Beat all gyms",
    },
    view_all: "View all tasks",
  },

  messages: {
    message: "You have {{total}} messages",
    items: {
      item1: {
        user: "John Doe",
        time: "Now",
        title: "Pikachu pet",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt",
      },
      item2: {
        user: "John Doe",
        time: "5 min ago",
        title: "Dress Eevee",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt",
      },
      item3: {
        user: "John Doe",
        time: "1:52 PM",
        title: "Team training",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt",
      },
      item4: {
        user: "John Doe",
        time: "4:03 PM",
        title: "Go to Safari Zone",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt",
      },
    },
  },

  profile: {
    account: {
      title: "Account",
      items: {
        updates: "Updates",
        messages: "Messages",
        tasks: "Tasks",
        comments: "Comments",
      },
    },
    settings: {
      title: "Settings",
      items: {
        profile: "Profile",
        settings: "Settings",
        payments: "Payments",
        projects: "Projects",
      },
    },
    lock_account: "Lock account",
    logout: "Logout",
  },

  breadcrumb: {
    home: "Home",
    library: "Library",
    data: "Data",
  },
};
