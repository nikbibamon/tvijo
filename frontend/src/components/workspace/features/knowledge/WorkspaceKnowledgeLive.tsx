'use client';

/**
 * Knowledge & learning: one place in the Workspace that links the existing public
 * knowledge surfaces (wiki, knowledge base, learning paths, knowledge map, DSHREM docs,
 * downloads and changelog). Stores are not merged; each link opens its canonical page.
 */
import { usePathname } from 'next/navigation';
import { parseLocale } from '@/i18n/config';

type L = 'en' | 'ru' | 'uk';
type Item = { href: string; title: string; text: string; external?: boolean };

function copy(l: L): { eyebrow: string; title: string; subtitle: string; listTitle: string; items: Item[] } {
  const wiki = l === 'en' ? '/wiki/' : `/wiki/${l}/`;
  const techMap = l === 'ru' ? '/wiki/ru/tvijo-technology-map/' : '/wiki/tvijo-technology-map/';
  if (l === 'ru') return {
    eyebrow: 'ЗНАНИЯ · ОБУЧЕНИЕ', title: 'Знания и обучение', listTitle: 'Разделы',
    subtitle: 'Публичные материалы Tvijo в одном месте: каждая ссылка ведёт на свою каноническую страницу.',
    items: [
      { href: wiki, title: 'Wiki технологий', text: 'Статьи, решения и наблюдения проекта с датами и доказательствами.' },
      { href: techMap, title: 'Карта технологий Tvijo', text: 'Как связаны AI OS, DSHREM, расширение и рабочее пространство.' },
      { href: `/${l}/kb`, title: 'База знаний', text: 'Практические руководства по AI, проверке источников и управлению.' },
      { href: `/${l}/learn`, title: 'Учебные маршруты', text: '17 уроков и 6 маршрутов для разных аудиторий.' },
      { href: '/knowledge-map/', title: 'Карта знаний', text: 'Поиск по опубликованным материалам и связям между ними.' },
      { href: 'https://dsh.tvijo.com/docs', title: 'Документация DSHREM', text: 'Шлюз, ключи проектов, квитанции задач и ограничения.', external: true },
      { href: 'https://dsh.tvijo.com/download', title: 'Загрузки', text: 'Расширение, Tvijo Code и CLI с версиями и контрольными суммами.', external: true },
      { href: `/${l}/changelog`, title: 'История выпусков', text: 'Опубликованные версии расширения и их ограничения.' },
    ],
  };
  if (l === 'uk') return {
    eyebrow: 'ЗНАННЯ · НАВЧАННЯ', title: 'Знання й навчання', listTitle: 'Розділи',
    subtitle: 'Публічні матеріали Tvijo в одному місці: кожне посилання веде на свою канонічну сторінку.',
    items: [
      { href: wiki, title: 'Wiki технологій', text: 'Статті, рішення та спостереження проєкту з датами й доказами.' },
      { href: techMap, title: 'Карта технологій Tvijo (EN)', text: 'Як пов’язані AI OS, DSHREM, розширення та робочий простір.' },
      { href: `/${l}/kb`, title: 'База знань', text: 'Практичні посібники з AI, перевірки джерел і управління.' },
      { href: `/${l}/learn`, title: 'Навчальні маршрути', text: '17 уроків і 6 маршрутів для різних аудиторій.' },
      { href: '/knowledge-map/', title: 'Карта знань', text: 'Пошук опублікованими матеріалами та зв’язками між ними.' },
      { href: 'https://dsh.tvijo.com/docs', title: 'Документація DSHREM', text: 'Шлюз, ключі проєктів, квитанції задач і обмеження.', external: true },
      { href: 'https://dsh.tvijo.com/download', title: 'Завантаження', text: 'Розширення, Tvijo Code і CLI з версіями та контрольними сумами.', external: true },
      { href: `/${l}/changelog`, title: 'Історія випусків (EN)', text: 'Опубліковані версії розширення та їхні обмеження.' },
    ],
  };
  return {
    eyebrow: 'KNOWLEDGE · LEARNING', title: 'Knowledge & learning', listTitle: 'Sections',
    subtitle: 'Tvijo public knowledge in one place; every link opens its own canonical page.',
    items: [
      { href: wiki, title: 'Technology wiki', text: 'Project articles, solutions and dated first-hand observations.' },
      { href: techMap, title: 'Tvijo technology map', text: 'How AI OS, DSHREM, the extension and the workspace connect.' },
      { href: '/en/kb', title: 'Knowledge base', text: 'Practical guides to AI, source checking and governance.' },
      { href: '/en/learn', title: 'Learning paths', text: '17 lessons and 6 audience paths.' },
      { href: '/knowledge-map/', title: 'Knowledge map', text: 'Search published material and the links between items.' },
      { href: 'https://dsh.tvijo.com/docs', title: 'DSHREM documentation', text: 'Gateway, project keys, task receipts and limits.', external: true },
      { href: 'https://dsh.tvijo.com/download', title: 'Downloads', text: 'Extension, Tvijo Code and CLI with versions and checksums.', external: true },
      { href: '/en/changelog', title: 'Release history', text: 'Published extension versions and their limits.' },
    ],
  };
}

export default function WorkspaceKnowledgeLive() {
  const route = parseLocale(usePathname());
  const l: L = route === 'ru' || route === 'uk' ? route : 'en';
  const t = copy(l);
  return (
    <div className="twk-admin-page">
      <header className="twk-admin-heading">
        <div>
          <p className="twk-eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
      </header>
      <section className="twk-admin-panel">
        <header className="twk-admin-panel-head"><div><h2>{t.listTitle}</h2></div></header>
        <div className="twk-link-list">
          {t.items.map((item) => (
            <a key={item.href} className="twk-link-item" href={item.href} {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}>
              <span className="twk-link-item-title">{item.title}{item.external ? ' ↗' : ''}</span>
              <span className="twk-link-item-text">{item.text}</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
