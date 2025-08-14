import {
  Terminal,
  Hive,
  Update,
  Build,
  Group,
  HardDisc,
  Handyman,
  ShieldPerson,
  Security
} from "../components/icons/jsx";

const commandData = [
  {
    name: "Basic",
    icon: <Terminal className="icon" />, // <-- added className
    items: [
      {
        script: "basic/sys-info.ps1",
        label: "Інформація про систему",
        desc: "Виводить основну інформацію про ОС, версію Windows, ім'я комп'ютера, користувача та апаратне забезпечення."
      },
      {
        script: "basic/process-list.ps1",
        label: "Список процесів",
        desc: "Показує список усіх запущених процесів на сервері."
      },
      {
        script: "basic/check-backup.ps1",
        label: "Перевірити бекапи",
        desc: "Перевіряє наявність папки 'backup' на диску C: та виводить усі файли і підпапки."
      },
      {
        script: null,
        label: "ipconfig",
        desc: "Виводить інформацію про мережеві інтерфейси та їх IP-адреси."
      },
      {
        script: null,
        label: "hostname",
        desc: "Виводить ім'я поточного комп'ютера (hostname)."
      },
      {
        script: null,
        label: "shutdown /r /t 0",
        desc: "Перезавантажує комп'ютер негайно."
      }
    ]
  },
  {
    name: "Medoc",
    icon: <Hive className="icon" />, // <-- added className
    items: [
      {
        script: "medoc/download-medoc-update.ps1",
        label: "Завантажити оновлення",
        desc: "Завантажує останнє оновлення для програми M.E.Doc."
      },
      {
        script: null,
        label: "Запустити оновлення",
        desc: "Запускає процес оновлення програми M.E.Doc."
      },
      {
        script: "medoc/read-medoc-log.ps1",
        label: "Перевірити версію",
        desc: "Перевіряє та виводить поточну версію програми M.E.Doc із журналу."
      }
    ]
  },
  {
    name: "Оновлення",
    icon: <Update className="icon" />, // <-- added className
    items: [
      {
        script: "update/install-updater.ps1",
        label: "Інсталяція модуля оновлень",
        desc: "Інсталює необхідні модулі для оновлення Windows через PowerShell."
      },
      {
        script: "update/search-updates.ps1",
        label: "Пошук оновлень",
        desc: "Шукає доступні оновлення Windows та антивірусу."
      },
      {
        script: "update/run-update.ps1",
        label: "Інсталювати оновлення",
        desc: "Встановлює всі доступні оновлення Windows та антивірусу."
      }
    ]
  },
  {
    name: "Агент",
    icon: <Build className="icon" />, // <-- added className
    items: [
      {
        script: "testing/send-script.ps1",
        label: "Тест зв'язку",
        desc: "Виконує тестовий скрипт для перевірки взаємодії з агентом."
      },
      {
        script: "testing/uninstall-agent.ps1",
        label: "Зупинити агент",
        desc: "Зупиняє службу агента. Щоб відновити роботу, запустіть службу AgentService."
      }
    ]
  },
  {
    name: "Користувачі",
    icon: <Group className="icon" />, // <-- added className
    items: [
      {
        script: "users/active-users.ps1",
        label: "Активні користувачі",
        desc: "Показує список користувачів, які зараз підключені через RDP."
      },
      {
        script: "users/last-login.ps1",
        label: "Останній вхід користувачів",
        desc: "Виводить інформацію про останній вхід кожного користувача на сервер."
      },
      {
        script: "users/user-kick-inactive.ps1",
        label: "Завершити відключені сеанси",
        desc: "Завершує всі відключені (disconnected) RDP-сеанси користувачів."
      },
      {
        script: "users/rdp-fail.ps1",
        label: "Невдалі входи по RDP",
        desc: "Показує список невдалих спроб входу по RDP."
      }
    ]
  },
  {
    name: "Диск",
    icon: <HardDisc className="icon" />, // <-- added className
    items: [
      {
        script: "disk/disk-space.ps1",
        label: "Дисковий простір",
        desc: "Виводить інформацію про використання дискового простору на всіх дисках."
      },
      {
        script: "disk/disk-check.ps1",
        label: "Аналіз простору для очистки",
        desc: "Аналізує простір на диску та показує, які файли займають найбільше місця."
      },
      {
        script: "disk/disk-cleanup.ps1",
        label: "Очистка диску",
        desc: "Виконує очистку тимчасових та непотрібних файлів на диску."
      }
    ]
  },
  {
    name: "DISM",
    icon: <Handyman className="icon" />, // <-- added className
    items: [
      {
        script: "dism/dism-analyze.ps1",
        label: "Аналіз DISM",
        desc: "Аналізує цілісність системних файлів Windows за допомогою DISM."
      },
      {
        script: "dism/dism-cleanup.ps1",
        label: "Очистка DISM",
        desc: "Виконує очистку компонентів Windows за допомогою DISM."
      },
      {
        script: "dism/dism-health.ps1",
        label: "Стан системи",
        desc: "Перевіряє та відновлює стан системних файлів Windows за допомогою DISM."
      },
      {
        script: "dism/dism-readlog.ps1",
        label: "Переглянути журнал DISM",
        desc: "Виводить останні 100 рядків журналу операцій DISM."
      }
    ]
  },
  {
    name: "RDP Guard",
    icon: <ShieldPerson className="icon" />, // <-- added className
    items: [
      {
        script: "rdpguard/rdpguard-checkblocked.ps1",
        label: "Перевірити заблоковані IP",
        desc: "Перевіряє чи є заблоковані IP-адреси в фаєрволі."
      },
      {
        script: "rdpguard/rdpguard-unlock.ps1",
        label: "Розблокувати усі IP",
        desc: "Розблоковує всі IP-адреси, заблоковані RDP Guard."
      },
      {
        script: "rdpguard/rdpguard-check-license.ps1",
        label: "Перевірити ліцензію",
        desc: "Перевіряє стан ліцензії RDP Guard."
      },
      {
        script: "rdpguard/rdpguard-restore-license.ps1",
        label: "Оновити ліцензію",
        desc: "Оновлює або відновлює ліцензію RDP Guard."
      }
    ]
  },
  {
    name: "Антивірус",
    icon: <Security className="icon" />, // <-- added className
    items: [
      {
        script: "antivirus/windows-defender-scan.ps1",
        label: "Швидке сканування Defender",
        desc: "Запускає швидке сканування Windows Defender."
      }
    ]
  }
];

export default commandData;
