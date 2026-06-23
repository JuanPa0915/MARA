const NAV_COLUMNS = [
  {
    heading: 'Explorar',
    links: [
      { label: 'Todos los Productos', href: '#collection' },
      { label: 'Nuevos Lanzamientos', href: '#' },
    ],
    colSpan: 'col-span-6 md:col-span-2',
  },
  {
    heading: 'Soporte',
    links: [
      { label: 'Atención al Cliente', href: '#' },
      { label: 'Envíos',      href: '#' },
      { label: 'Devoluciones',       href: '#' },
    ],
    colSpan: 'col-span-6 md:col-span-2',
  },
];

const SOCIAL_LINKS = [
  { label: 'Instagram', href: '#' },
  { label: 'Pinterest', href: '#' },
  { label: 'Vogue',     href: '#' },
];

const LinkColumn = ({ heading, links, colSpan }) => (
  <div className={colSpan}>
    <h4 className="font-label-lg text-label-lg uppercase mb-6 text-primary">
      {heading}
    </h4>
    <ul className="space-y-4">
      {links.map(({ label, href }) => (
        <li key={label}>
          <a href={href} className="footer-link">{label}</a>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => (
  <footer
    className="w-full pt-[120px] pb-10 bg-surface-container-low"
    aria-label="Pie de página MARA"
  >
    <div className="border-t border-outline-variant/15 mx-[40px]">

      <div
        className="grid grid-cols-12 gap-6
                   px-5 md:px-[80px] max-w-[1440px] mx-auto pt-16"
      >
        <div className="col-span-12 md:col-span-4 mb-12 md:mb-0">
          <a
            href="/"
            className="font-headline-md text-headline-md text-primary uppercase mb-6 block"
            aria-label="MARA — ir al inicio"
          >
            MARA
          </a>
          <p className="font-body-md font-light text-on-surface-variant max-w-xs">
            Elevando lo cotidiano a través del diseño arquitectónico y
            una artesanía inigualable.
          </p>
        </div>

        {NAV_COLUMNS.map((col) => (
          <LinkColumn key={col.heading} {...col} />
        ))}

        <div className="col-span-12 md:col-span-4">
          <h4 className="font-label-lg text-label-lg uppercase mb-6 text-primary">
            Redes Sociales
          </h4>
          <div className="flex gap-6 flex-wrap">
            {SOCIAL_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="footer-link"
                aria-label={`MARA en ${label}`}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div
        className="px-5 md:px-[80px] max-w-[1440px] mx-auto mt-24
                   flex flex-col md:flex-row justify-between items-center gap-4"
      >
        <p className="font-body-md font-light text-on-surface-variant">
          © {new Date().getFullYear()} MARA. Todos los Derechos Reservados.
        </p>
        <div className="flex gap-8">
          <a href="#" className="footer-link">Privacidad</a>
          <a href="#" className="footer-link">Newsletter</a>
        </div>
      </div>

    </div>
  </footer>
);

export default Footer;
