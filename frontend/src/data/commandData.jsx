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
    icon: <Terminal className="icon" />,
    items: [
      {
        script: "basic/sys-info.ps1",
        label: "Інформація про систему",
        desc: "Виводить основну інформацію про ОС, версію Windows, ім'я комп'ютера та апаратне забезпечення."
      },
      {
        script: "basic/user-info.ps1",
        label: "Інформація про користувачів",
        desc: "Показує інформацію про користувачів, які увійшли в систему."
      },
      {
        script: "basic/process-list.ps1",
        label: "Повний список процесів",
        desc: "Виводить список усіх запущених процесів на сервері."
      },
      {
        script: "basic/network-info.ps1",
        label: "Мережеві налаштування",
        desc: "Показує IP-адреси, відкриті порти та правила брендмауера."
      },
      {
        script: "basic/check-backup.ps1",
        label: "Бекапи",
        desc: "Перевіряє наявність папки 'backup' на диску та виводить всі файли і підпапки."
      }
    ]
  },
  {
    name: "Оновлення",
    icon: <Update className="icon" />,
    items: [
      {
        script: "update/install-updater.ps1",
        label: "Інсталювати модуль оновлення",
        desc: "Інсталює необхідні модулі для оновлення Windows через PowerShell."
      },
      {
        script: "update/search-updates.ps1",
        label: "Перевірити наявність оновлень",
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
    name: "Антивірус",
    icon: <Security className="icon" />,
    items: [
      {
        script: "antivirus/windows-defender-scan-quick.ps1",
        label: "Швидке сканування",
        desc: "Запускає швидке сканування Windows Defender."
      },
      {
        script: "antivirus/windows-defender-scan-full.ps1",
        label: "Тривале сканування",
        desc: "Виконує повне сканування системи Windows Defender."
      }
    ]
  },
  {
    name: "Диск",
    icon: <HardDisc className="icon" />,
    items: [
      {
        script: "disk/disk-space.ps1",
        label: "Перевірити дисковий простір",
        desc: "Виводить інформацію про використання дискового простору на всіх дисках."
      },
      {
        script: "disk/disk-check.ps1",
        label: "Перевірити місце для очистки",
        desc: "Аналізує простір на диску та показує, які файли займають найбільше місця."
      },
      {
        script: "disk/disk-cleanup.ps1",
        label: "Очистити місце",
        desc: "Виконує очистку тимчасових та непотрібних файлів на диску."
      }
    ]
  },
  {
    name: "Користувачі",
    icon: <Group className="icon" />,
    items: [
      {
        script: "users/create-user.ps1",
        label: "Створити користувача",
        desc: "Створює нового користувача на сервері."
      },
      {
        script: "users/block-user.ps1",
        label: "Заблокувати користувача",
        desc: "Блокує доступ обраного користувача."
      }
    ]
  },
  {
    name: "Medoc",
    icon: <Hive className="icon" />,
    items: [
      {
        script: "medoc/read-medoc-log.ps1",
        label: "Перевірити версію",
        desc: "Перевіряє та виводить поточну версію програми M.E.Doc."
      }
    ]
  }
];

export default commandData;
