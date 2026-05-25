const isProduction = () => process.env.NODE_ENV === 'production'

const errorDetails = (error) => {
  if (isProduction()) return {}
  return { error: error?.message || 'Error desconocido' }
}

const sendServerError = (res, message, error, status = 500) => {
  return res.status(status).json({
    message,
    ...errorDetails(error)
  })
}

module.exports = {
  errorDetails,
  sendServerError
}
