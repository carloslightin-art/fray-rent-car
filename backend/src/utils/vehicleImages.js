const parseVehicleGallery = (value) => {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed.filter(Boolean) : []
    } catch (_error) {
      return value ? [value] : []
    }
  }
  return []
}

const uniqueImages = (images = []) => Array.from(new Set(images.filter(Boolean)))

const normalizeVehiclePayload = (payload = {}) => {
  const allowed = {
    brand: payload.brand,
    model: payload.model,
    year: payload.year,
    price_per_day: payload.price_per_day,
    status: payload.status,
    category: payload.category,
    image_url: payload.image_url || null,
    description: payload.description || null,
    is_active: payload.is_active,
    is_featured: payload.is_featured,
    sort_order: payload.sort_order,
    seats: payload.seats,
    vehicle_type: payload.vehicle_type,
    insurance_included: payload.insurance_included,
    gallery_images: payload.gallery_images
  }

  Object.keys(allowed).forEach((key) => {
    if (allowed[key] === undefined) delete allowed[key]
  })

  if (allowed.gallery_images !== undefined) {
    allowed.gallery_images = uniqueImages(parseVehicleGallery(allowed.gallery_images))
  }

  if (allowed.seats !== undefined && allowed.seats !== null && allowed.seats !== '') {
    allowed.seats = Number.parseInt(allowed.seats, 10) || 5
  }

  if (allowed.insurance_included !== undefined) {
    allowed.insurance_included = allowed.insurance_included === true || allowed.insurance_included === 'true' || allowed.insurance_included === 1 || allowed.insurance_included === '1'
  }

  return allowed
}

const serializeVehicle = (vehicle) => {
  const data = typeof vehicle.toJSON === 'function' ? vehicle.toJSON() : { ...vehicle }
  const gallery = uniqueImages([
    data.image_url,
    ...parseVehicleGallery(data.gallery_images)
  ])
  return {
    ...data,
    image_url: data.image_url || gallery[0] || null,
    gallery_images: gallery,
    seats: data.seats || 5,
    vehicle_type: data.vehicle_type || data.category || 'Económico',
    insurance_included: data.insurance_included !== false
  }
}

module.exports = {
  parseVehicleGallery,
  uniqueImages,
  normalizeVehiclePayload,
  serializeVehicle
}
