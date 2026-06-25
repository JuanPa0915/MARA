import { useState } from 'react';

const INITIAL_FORM = {
  nombre: '',
  celular: '',
  email: '',
  direccion: '',
  apartamento: '',
  barrio: '',
  ciudad: '',
  departamento: '',
  codigoPostal: '',
  documento: '',
  tipoDocumento: 'CC',
  indicaciones: '',
};

const Checkout = ({ cartItems, total, processing, onBack, onSubmit }) => {
  const [form, setForm] = useState(INITIAL_FORM);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <main className="min-h-screen pt-[80px] bg-background">
      <div className="max-w-[1440px] mx-auto px-5 md:px-[80px] py-[60px]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-label-lg text-label-lg uppercase tracking-widest text-primary hover:opacity-70 transition-opacity mb-12"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Volver
        </button>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            <form
              onSubmit={handleSubmit}
              className="flex-1"
            >
            <h1 className="font-headline-lg text-headline-lg uppercase mb-10">
              Datos de Envío
            </h1>

            <section className="mb-10">
              <h2 className="font-label-lg text-label-lg uppercase tracking-widest text-primary mb-6 pb-2 border-b border-outline-variant/30">
                1. Datos de Identificación y Contacto
              </h2>

              <div className="space-y-5">
                <div>
                  <label htmlFor="nombre" className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant block mb-2">
                    Nombre completo <span className="text-error">*</span>
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    required
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Ej. María García López"
                    className="w-full border border-outline-variant/50 px-4 py-3 font-body-md bg-transparent outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="celular" className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant block mb-2">
                      Celular / Teléfono <span className="text-error">*</span>
                    </label>
                    <input
                      id="celular"
                      name="celular"
                      type="tel"
                      required
                      value={form.celular}
                      onChange={handleChange}
                      placeholder="Ej. +57 300 123 4567"
                      className="w-full border border-outline-variant/50 px-4 py-3 font-body-md bg-transparent outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant block mb-2">
                      Correo electrónico <span className="text-error">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Ej. maria@ejemplo.com"
                      className="w-full border border-outline-variant/50 px-4 py-3 font-body-md bg-transparent outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="font-label-lg text-label-lg uppercase tracking-widest text-primary mb-6 pb-2 border-b border-outline-variant/30">
                2. Datos Precisos de Envío
              </h2>

              <div className="space-y-5">
                <div>
                  <label htmlFor="direccion" className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant block mb-2">
                    Dirección completa <span className="text-error">*</span>
                  </label>
                  <input
                    id="direccion"
                    name="direccion"
                    type="text"
                    required
                    value={form.direccion}
                    onChange={handleChange}
                    placeholder="Ej. Cra 45 # 23-12"
                    className="w-full border border-outline-variant/50 px-4 py-3 font-body-md bg-transparent outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="apartamento" className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant block mb-2">
                    Apartamento, torre, oficina
                  </label>
                    <input
                      id="apartamento"
                      name="apartamento"
                      type="text"
                      required
                      value={form.apartamento}
                      onChange={handleChange}
                    placeholder="Ej. Torre 2, Apto 501"
                    className="w-full border border-outline-variant/50 px-4 py-3 font-body-md bg-transparent outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label htmlFor="barrio" className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant block mb-2">
                      Barrio <span className="text-error">*</span>
                    </label>
                    <input
                      id="barrio"
                      name="barrio"
                      type="text"
                      required
                      value={form.barrio}
                      onChange={handleChange}
                      placeholder="Ej. El Poblado"
                      className="w-full border border-outline-variant/50 px-4 py-3 font-body-md bg-transparent outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="ciudad" className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant block mb-2">
                      Ciudad / Municipio <span className="text-error">*</span>
                    </label>
                    <input
                      id="ciudad"
                      name="ciudad"
                      type="text"
                      required
                      value={form.ciudad}
                      onChange={handleChange}
                      placeholder="Ej. Medellín"
                      className="w-full border border-outline-variant/50 px-4 py-3 font-body-md bg-transparent outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="departamento" className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant block mb-2">
                      Departamento <span className="text-error">*</span>
                    </label>
                    <input
                      id="departamento"
                      name="departamento"
                      type="text"
                      required
                      value={form.departamento}
                      onChange={handleChange}
                      placeholder="Ej. Antioquia"
                      className="w-full border border-outline-variant/50 px-4 py-3 font-body-md bg-transparent outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="codigoPostal" className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant block mb-2">
                    Código Postal <span className="text-error">*</span>
                  </label>
                    <input
                      id="codigoPostal"
                      name="codigoPostal"
                      type="text"
                      required
                      value={form.codigoPostal}
                      onChange={handleChange}
                    placeholder="Ej. 050021"
                    className="w-full border border-outline-variant/50 px-4 py-3 font-body-md bg-transparent outline-none focus:border-primary transition-colors max-w-xs"
                  />
                </div>

                <div>
                  <label htmlFor="indicaciones" className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant block mb-2">
                    Indicaciones adicionales
                  </label>
                    <textarea
                      id="indicaciones"
                      name="indicaciones"
                      rows={2}
                      required
                      value={form.indicaciones}
                      onChange={handleChange}
                    placeholder="Ej. Frente al parque principal — Portería de la torre 2"
                    className="w-full border border-outline-variant/50 px-4 py-3 font-body-md bg-transparent outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="font-label-lg text-label-lg uppercase tracking-widest text-primary mb-6 pb-2 border-b border-outline-variant/30">
                3. Documento de Identidad
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div>
                  <label htmlFor="tipoDocumento" className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant block mb-2">
                    Tipo
                  </label>
                    <select
                      id="tipoDocumento"
                      name="tipoDocumento"
                      required
                      value={form.tipoDocumento}
                      onChange={handleChange}
                    className="w-full border border-outline-variant/50 px-4 py-3 font-body-md bg-transparent outline-none focus:border-primary transition-colors"
                  >
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="NIT">NIT</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label htmlFor="documento" className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant block mb-2">
                    Número de documento <span className="text-error">*</span>
                  </label>
                  <input
                    id="documento"
                    name="documento"
                    type="text"
                    required
                    value={form.documento}
                    onChange={handleChange}
                    placeholder="Ej. 1234567890"
                    className="w-full border border-outline-variant/50 px-4 py-3 font-body-md bg-transparent outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </section>

            <button type="submit" disabled={processing} className="btn-primary w-full md:w-auto text-center disabled:opacity-40 disabled:pointer-events-none">
              {processing ? 'Procesando pago…' : 'Confirmar Pedido'}
            </button>
          </form>

          <aside className="lg:w-[380px]">
            <div className="bg-surface-container-low p-6 lg:sticky lg:top-[140px]">
              <h2 className="font-headline-md text-headline-md uppercase mb-6">
                Tu Pedido
              </h2>

              <ul className="space-y-4 mb-6">
                {cartItems.map((item, index) => (
                  <li key={index} className="flex gap-4 pb-4 border-b border-outline-variant/20">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-20 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-label-lg text-label-lg uppercase truncate">
                        {item.name}
                      </p>
                      <p className="font-body-md text-on-surface-variant">
                        {item.price.toLocaleString('es-CO')}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex justify-between items-center pt-4 border-t border-outline-variant/30">
                <span className="font-label-lg text-label-lg uppercase">Total</span>
                <span className="font-headline-md text-headline-md">
                  {total.toLocaleString('es-CO')}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Checkout;
