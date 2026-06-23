/**
 * productsData.js
 * ───────────────
 * Single source of truth for the 6 MARA collection pieces.
 * Shape: { id, name, price, imageUrl, alt }
 *
 * Keeping data here (not inside components) means:
 *  • Swapping in a real API call later only touches this file
 *  • ProductGrid stays a pure presentational mapping component
 *  • Each product's `alt` text doubles as the a11y description
 *    AND the original AI image prompt metadata from the HTML
 */

export const productsData = [
  {
    id: 1,
    name: 'The Sculptor Tote',
    price: '$2,450',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAWh_APCV16v74sn_5uR-Z4hAfMCheZzYnzADI6A8X0edlDWqkgCXmTn_fwV5YExY3-MdYWinYh7iDTC1jLKHBbC_cTFvmt9dH2AbIUvDLZ82e8IyXJTi571ATdG53BaW4Q7_yUCLP4zBxvF08BilT25ZAsZJT2t7qgc_CxQZYJVyu3MDQ0b84PQm3z0WrzSAmMKGUCg0oGMlcxlOIxuV5nYwp9g7U_1vsseUt-PxtRX75rU3enyXnhDfKG_59pBIYdpdED9kSZ2aw',
    alt: 'Bolso tote estructurado de cuero taupe sobre pedestal a juego, iluminación arquitectónica suave, fondo crema.',
  },
  {
    id: 2,
    name: 'Midnight Envelope',
    price: '$1,800',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCHG9oHhQvbAnSIfH0D09Qwo0aWvg6EeTh7GdhASOY-eFdUKugW3TNlIlB4l4vdzTLvRVWALJ2g5FoL2CFvuyqt4ouBRpprquWiioDFP4fFBzhTg9MhBjXaBJTPn9lv-PkQpd3H8WusWXDowU1XRrSn6RxgPnLmVsuVlPXs3k0iMjO-ZEZnGsm1nTa9R-vxqv1JviRiooLJApq7GoJO2JyBqBar7j0D2XAMIo-YmjtDcr9nryCwCwPQaeCY_fToFSzfAeKVH84OsLw',
    alt: 'Clutch de noche negro con broche metálico sutil sobre mármol pulido, editorial de lujo.',
  },
  {
    id: 3,
    name: 'Petite Nomad',
    price: '$1,250',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD_pJYkJp4y2Z0iupuV2bOBYk-5ExCFz4Fk9-VSrZJOK2na2UaD8UB74yy1AJ6nKeRk7wySC6awxpAocw3BzNXba_BysZ4yq0SngCEG9k0ee-4XdqvWPhYQsZlRfE-3ahC6JJsrl-ELxF2F3H1vJo89mttDGx0P_OeeX92O0W_EzkPDsTEv3Ci9ezXB2-OUgnjN22EQ_wuqzsFTQy8x5gqjyhhpTc0GdnDMup4BBHVDSZRlQlJHehoVh3nUH9nWzJCYstUOm2w11nc',
    alt: 'Pequeño bolso cruzado de cuero caramelo colgado de un gancho de bronce minimalista, pared beige texturizada.',
  },
  {
    id: 4,
    name: 'Grand Escape',
    price: '$3,100',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB7iYqLN0aOac8H3tS2x8zIaVWT0iGYEC0lGw6QXGcLp5rtLWoK-tuBb45PY1vFWPcIqFXhQ6b8xkDDhuXFgrbm-zD1iSTlzCEdDHFo5rrzodvIYkgOK9EJDtFsciG1Vb4clW7c5Jmuuu94B1zwCGrZCELjadUNSEaNEcrk4X_sfYijaq1YD_PAWK_zo_ZvH0ftOaiZK2yaqfLVVIT2NU3tM_VNy8miB3BsME10rnyO9y6fxPeYJ6nij05zuSWCi2DZ1H80-WetSiY',
    alt: 'Bolso de viaje oversized en cuero marfil sobre banco de madera minimalista, habitación luminosa y serena.',
  },
  {
    id: 5,
    name: 'Serene Bucket',
    price: '$1,950',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuALb_CfjNuBu7CNWmMxLlRdxZ5XnJfEKkP5B2jn3O8ji8b-83DRCjwZseX2DTYqP4t20QjUk_d1gCrXq_cS7tn-LoGPYGsKx0MgXubCPznVTK8N5OcuixbA4HbxvVzHGJifLJNVt7ASNqgoBAPRHHevM5KWMvId3YGblGvpnSmo_BMPRFI-i5nYftkWffiIo6eMyW-8gs5j4FB_pj5ZpVRXKZIzKl3jYd13S8FKV3Ln2oTkhyR4LQ8BdZ2YzcmtoMdMYY7zTJbiKHU',
    alt: 'Bolso bucket de cuero verde salvia con cierre de cordón, fondo de jardín a hora dorada desenfocado.',
  },
  {
    id: 6,
    name: 'The Monarch',
    price: '$2,800',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAIqsRreb2a88XG5CJatuOCPl62e9B-sakeukEVta7ORc05QN8GRKg_3HU2g6REKnSE-n3wxheKFV8-38Y5xrfjvItxe9euqYasCsoB-1V1cGNF6MfAKj3WnWPH1atbgrpga9L5ECx0exZHv5oUOg25J5MDYDGlZzeCvglcMfNVEpMtJdOFKzFU-VIgTYPkvul6gUb2VdMxU1mn2avnQIHYu-tWmFrtwSEqY8XkPeLuKxuKv91aqfRbfa4RwHBZE7MxAHAUJzu658w',
    alt: 'Bolso top-handle burdeos con herrajes dorados arquitectónicos sobre bloque de piedra, sombras limpias y dramáticas.',
  },
];
