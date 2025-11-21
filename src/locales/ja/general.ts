export const general = {
  login: {
    title: "ログイン",
    description: "アカウントにアクセス",
    form: {
      username: "ユーザー名",
      password: "パスワード",
      submit: "ログイン",
      loading: "読み込み中…",
    },
    forgot_password: "パスワードをお忘れですか？",
    signup: {
      title: "新規登録",
      description:
        "これは https://github.com/kitloong/nextjs-dashboard のデモページです。「Login」をクリックして完全なダッシュボードを表示できます。",
    },
    message: {
      auth_failed: "ユーザー名またはパスワードが無効です",
    },
  },

  pagination: {
    summary: "{{from}} 〜 {{to}} 件目 / 全 {{total}} 件",
    rows_per_page: "1ページあたりの行数",
  },

  signup: {
    title: "登録",
    description: "アカウントを作成",
    register_now: "今すぐ登録！",
    form: {
      username: "ユーザー名",
      email: "メールアドレス",
      password: "パスワード",
      confirm_password: "パスワード確認",
      submit: "アカウント作成",
    },
  },

  action: {
    info: "情報",
    edit: "編集",
    delete: "削除",
    submit: "送信",
    submitting: "送信中…",
    reset: "リセット",
  },

  theme: {
    light: "ライト",
    dark: "ダーク",
    auto: "自動",
  },

  dashboard: {
    featured: {
      user: "ユーザー",
      income: "収益",
      conversion_rate: "コンバージョン率",
      sessions: "セッション",
      action: {
        action1: "アクション",
        action2: "別のアクション",
        action3: "その他",
      },
    },

    traffic: {
      title: "トラフィック",
      duration: "2021年1月〜7月",
      option: {
        day: "日",
        month: "月",
        year: "年",
      },
      chart: {
        xlabel1: "1月",
        xlabel2: "2月",
        xlabel3: "3月",
        xlabel4: "4月",
        xlabel5: "5月",
        xlabel6: "6月",
        xlabel7: "7月",
      },
      users: "ユーザー数",
      views: "閲覧数",
      category1: "訪問",
      category2: "ユニーク",
      category3: "ページビュー",
      category4: "新規ユーザー",
      category5: "直帰率",
    },

    sales: {
      title: "トラフィックと売上",
      stats: {
        stat1: "新規顧客",
        stat2: "リピーター",
        stat3: "ページビュー",
        stat4: "オーガニック",
      },
      monday: "月曜日",
      tuesday: "火曜日",
      wednesday: "水曜日",
      thursday: "木曜日",
      friday: "金曜日",
      saturday: "土曜日",
      sunday: "日曜日",
      male: "男性",
      female: "女性",
      organic: "オーガニック検索",
      facebook: "Facebook",
      twitter: "Twitter",
      linkedin: "LinkedIn",
    },

    listing: {
      headers: {
        header1: "ユーザー",
        header2: "利用状況",
        header3: "支払い方法",
        header4: "アクティビティ",
      },
      user_status: {
        new: "新規",
        recurring: "リピート",
      },
      registered: "登録済み",
      last_login: "最終ログイン",
      usage_duration: "2020年6月11日〜2020年7月10日",
      registered_at: "2020年1月1日",

      items: {
        item1: { name: "Yiorgos Avraamu", login_at: "10秒前" },
        item2: { name: "Avram Tarasios", login_at: "5分前" },
        item3: { name: "Quintin Ed", login_at: "1時間前" },
        item4: { name: "Enéas Kwadwo", login_at: "先月" },
        item5: { name: "Agapetus Tadeáš", login_at: "先週" },
        item6: { name: "Friderik Dávid", login_at: "昨日" },
      },
    },
  },

  pokemons: {
    title: "ポケモン",
    add_new: "新規追加",
    attribute: {
      name: "名前",
      type: "タイプ",
      egg_group: "タマゴグループ",
      hp: "HP",
      attack: "攻撃",
      defense: "防御",
      sp_attack: "特攻",
      sp_defense: "特防",
      speed: "素早さ",
      total: "合計",
    },
  },

  featured_nav: {
    dashboard: "ダッシュボード",
    users: "ユーザー",
    settings: "設定",
  },

  notification: {
    message: "あなたには {{total}} 件の通知があります",
    items: {
      new_user: "新しいユーザーが登録されました",
      deleted_user: "ユーザーが削除されました",
      sales_report: "売上レポートの準備ができました",
      new_client: "新規クライアント",
      server_overloaded: "サーバーが過負荷です",
    },
    server: {
      title: "サーバー",
      processes: "プロセス",
      cores: "コア",
      items: {
        cpu: "CPU使用率",
        memory: "メモリ使用率",
        ssd1: "SSD 1 使用率",
      },
    },
  },

  task: {
    message: "あなたには {{total}} 件の未完了タスクがあります",
    items: {
      task1: "Next.JS をアップデート",
      task2: "ポケモンを育成",
      task3: "ポケデックスを完成",
      task4: "全ての色違いを捕まえる",
      task5: "全ジム制覇",
    },
    view_all: "すべてのタスクを見る",
  },

  messages: {
    message: "あなたには {{total}} 件のメッセージがあります",
    items: {
      item1: {
        user: "John Doe",
        time: "今",
        title: "ピカチュウのペット",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt",
      },
      item2: {
        user: "John Doe",
        time: "5分前",
        title: "イーブイを着せ替え",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt",
      },
      item3: {
        user: "John Doe",
        time: "1:52 PM",
        title: "チームトレーニング",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt",
      },
      item4: {
        user: "John Doe",
        time: "4:03 PM",
        title: "サファリゾーンへ行く",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt",
      },
    },
  },

  profile: {
    account: {
      title: "アカウント",
      items: {
        updates: "アップデート",
        messages: "メッセージ",
        tasks: "タスク",
        comments: "コメント",
      },
    },
    settings: {
      title: "設定",
      items: {
        profile: "プロフィール",
        settings: "設定",
        payments: "支払い",
        projects: "プロジェクト",
      },
    },
    lock_account: "アカウントをロック",
    logout: "ログアウト",
  },

  breadcrumb: {
    home: "ホーム",
    library: "ライブラリ",
    data: "データ",
  },
};
