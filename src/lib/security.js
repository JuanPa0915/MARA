const FIELD_LIMITS = {
  nombre: 120,
  celular: 30,
  email: 254,
  direccion: 180,
  apartamento: 120,
  barrio: 100,
  ciudad: 100,
  departamento: 100,
  codigoPostal: 20,
  documento: 40,
  tipoDocumento: 12,
  indicaciones: 300,
}

const DOCUMENT_TYPES = new Set(['CC', 'CE', 'NIT', 'PP'])

function getProductId(product) {
  return product?.id ?? product?.producto_id ?? product?.productoId
}

export function sanitizeText(value, maxLength = 160) {
  return String(value ?? '')
    .normalize('NFKC')
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0)
      return code < 32 || code === 127 ? ' ' : char
    })
    .join('')
    .replace(/[<>`]/g, '')
    .slice(0, maxLength)
}

export function sanitizeCheckoutField(name, value) {
  const maxLength = FIELD_LIMITS[name] ?? 160
  const sanitized = sanitizeText(value, maxLength)

  if (name === 'email') {
    return sanitized.toLowerCase().replace(/\s/g, '')
  }

  if (name === 'celular') {
    return sanitized.replace(/[^\d+\s()-]/g, '')
  }

  if (name === 'codigoPostal' || name === 'documento') {
    return sanitized.replace(/[^a-zA-Z0-9-]/g, '')
  }

  if (name === 'tipoDocumento') {
    return DOCUMENT_TYPES.has(sanitized) ? sanitized : 'CC'
  }

  return sanitized
}

export function normalizeCheckoutForm(form) {
  return Object.keys(FIELD_LIMITS).reduce((normalized, field) => {
    normalized[field] = sanitizeCheckoutField(field, form[field]).trim()
    return normalized
  }, {})
}

export function validateCheckoutForm(form) {
  const normalized = normalizeCheckoutForm(form)
  const requiredFields = [
    ['nombre', 'nombre completo'],
    ['celular', 'celular o telefono'],
    ['email', 'correo electronico'],
    ['direccion', 'direccion'],
    ['barrio', 'barrio'],
    ['ciudad', 'ciudad'],
    ['departamento', 'departamento'],
    ['codigoPostal', 'codigo postal'],
    ['documento', 'numero de documento'],
  ]

  for (const [field, label] of requiredFields) {
    if (!normalized[field]) {
      throw new Error(`Completa el campo ${label}.`)
    }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalized.email)) {
    throw new Error('Ingresa un correo electronico valido.')
  }

  if (!/^\+?[\d\s()-]{7,30}$/.test(normalized.celular)) {
    throw new Error('Ingresa un numero de celular valido.')
  }

  if (!/^[a-zA-Z0-9-]{4,40}$/.test(normalized.documento)) {
    throw new Error('Ingresa un numero de documento valido.')
  }

  if (!DOCUMENT_TYPES.has(normalized.tipoDocumento)) {
    throw new Error('Selecciona un tipo de documento valido.')
  }

  return normalized
}

export function toSafePositiveInteger(value, label = 'valor') {
  const parsed = typeof value === 'string'
    ? Number(value.replace(/[^\d.-]/g, ''))
    : Number(value)

  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`${label} invalido.`)
  }

  return parsed
}

export function formatCop(value) {
  return toSafePositiveInteger(value, 'precio').toLocaleString('es-CO')
}

export function normalizeProduct(rawProduct) {
  const priceValue = toSafePositiveInteger(rawProduct?.precio ?? rawProduct?.priceValue ?? rawProduct?.price, 'precio')

  return {
    id: getProductId(rawProduct),
    name: sanitizeText(rawProduct.nombre ?? rawProduct.name, 120).trim(),
    modelo: sanitizeText(rawProduct.modelo, 80).trim(),
    color: sanitizeText(rawProduct.color, 80).trim(),
    price: formatCop(priceValue),
    priceValue,
    stock: Number(rawProduct.stock ?? 0),
    descripcion: sanitizeText(rawProduct.descripcion, 500).trim(),
    detalles: sanitizeText(rawProduct.detalles, 500).trim(),
    imageUrl: sanitizeImageUrl(rawProduct.imagen_url ?? rawProduct.imageUrl),
    alt: sanitizeText(`${rawProduct.nombre ?? rawProduct.name ?? 'Producto'} - ${rawProduct.modelo ?? ''}`, 160).trim(),
  }
}

export function normalizeCartItem(product) {
  const price = toSafePositiveInteger(product?.priceValue ?? product?.price ?? product?.precio, 'precio del producto')
  const id = getProductId(product)

  if (id === undefined || id === null || id === '') {
    throw new Error('Producto sin identificador valido.')
  }

  return {
    id,
    name: sanitizeText(product.name, 120).trim(),
    price,
    imageUrl: sanitizeImageUrl(product.imageUrl),
  }
}

export function calculateCartTotal(cartItems) {
  return cartItems.reduce((sum, item) => sum + toSafePositiveInteger(item.price, 'precio del producto'), 0)
}

export function sanitizeImageUrl(value) {
  const url = String(value ?? '').trim()

  try {
    const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://local.invalid'
    const parsed = new URL(url, appOrigin)
    if (parsed.protocol === 'https:' || parsed.origin === appOrigin) {
      return parsed.href
    }
  } catch {
    return ''
  }

  return ''
}

export async function validateCartForCheckout(cartItems, supabase) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error('Tu bolsa esta vacia.')
  }

  const ids = cartItems.map(getProductId).filter((id) => id !== undefined && id !== null && id !== '')
  if (ids.length !== cartItems.length) {
    throw new Error('El carrito contiene productos invalidos.')
  }

  const uniqueIds = [...new Set(ids.map(String))]
  const { data, error } = await supabase
    .from('productos')
    .select('id, nombre, precio, stock, imagen_url')
    .in('id', uniqueIds)

  if (error) throw error

  const productsById = new Map((data ?? []).map((item) => [String(item.id), item]))
  const quantities = ids.reduce((acc, id) => {
    const key = String(id)
    acc.set(key, (acc.get(key) ?? 0) + 1)
    return acc
  }, new Map())

  for (const [id, quantity] of quantities) {
    const product = productsById.get(id)
    if (!product) {
      throw new Error('Uno de los productos del carrito ya no existe.')
    }

    if (Number(product.stock ?? 0) < quantity) {
      throw new Error(`"${sanitizeText(product.nombre, 120).trim() || 'Producto'}" ya no tiene stock suficiente.`)
    }
  }

  let verifiedTotal = 0
  const verifiedItems = cartItems.map((item) => {
    const product = productsById.get(String(getProductId(item)))
    const databasePrice = toSafePositiveInteger(product.precio, 'precio en catalogo')
    const cartPrice = toSafePositiveInteger(item.price ?? item.priceValue ?? item.precio, 'precio del carrito')

    if (cartPrice !== databasePrice) {
      throw new Error('El precio de uno de los productos cambio. Actualiza tu carrito antes de pagar.')
    }

    verifiedTotal += databasePrice

    return {
      id: product.id,
      name: sanitizeText(product.nombre, 120).trim(),
      price: databasePrice,
      imageUrl: sanitizeImageUrl(product.imagen_url),
    }
  })

  return {
    verifiedItems,
    verifiedTotal,
    amountInCents: verifiedTotal * 100,
  }
}
