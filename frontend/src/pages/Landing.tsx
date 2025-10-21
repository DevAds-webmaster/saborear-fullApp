import type React from "react"

import { useState } from "react"
import { MessageCircle, Menu, CheckCircle, Settings, Smartphone, Paintbrush , TvMinimal, LogIn  } from "lucide-react"
import { Link } from "react-router-dom" 


export default function LandingPage() {
  const [urlDemo, setUrlDemo] = useState("https://devadsdemosp.sabore.ar/menu")
  const [showDemo, setShowDemo] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    restaurant: "",
    phone: "",
    message: "",
  })
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Form submitted:", formData)
    //alert(`¡Gracias por tu interés ${formData.name}! Nos pondremos en contacto contigo pronto.`)
    const res = await fetch("https://formspree.io/f/mgvyoryk", {
      method: "POST",
      body: JSON.stringify(formData),
      headers: {
        Accept: "application/json",
      },
    });

    if (res.ok) {
      setSuccess(true);
      
      setFormData({
        name: "",
        email: "",
        restaurant: "",
        phone: "",
        message: "",
      });
    } else {
      const errorData = await res.json();
      console.error("Error submitting form:", errorData);
      alert("Hubo un error al enviar tu mensaje. Por favor, inténtalo de nuevo más tarde.");
    }
  }

  const whatsappMessage = encodeURIComponent("Hola, estoy interesado en este servicio...")
  const whatsappUrl = `https://wa.me/5491137658523?text=${whatsappMessage}`

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* <div className="text-2xl font-bold text-orange-600">Sabore.ar</div> */}
          <img
            src="assets/imgs/logo.png"
            alt="Sabore.ar Logo"
            className="h-16 w-auto"
          />
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link to={"#banner"} className="text-gray-700 hover:text-orange-600 transition-colors">
              Home
            </Link>
            <Link to={"#about"} className="text-gray-700 hover:text-orange-600 transition-colors">
              Sobre Nosotros
            </Link>
            <Link to={"#services"} className="text-gray-700 hover:text-orange-600 transition-colors">
              Servicios
            </Link>
            <Link to={"#contact"} className="text-gray-700 hover:text-orange-600 transition-colors">
              Contacto
            </Link>
            <Link to={"/dashboard"} className="bg-orange-600 hover:bg-orange-400 text-white hover:text-gray-200 transition-colors flex px-2 py-1 rounded-md  shadow shadow-lg hover:shadow-xl">
              Login <LogIn/>
            </Link>
          </div>

          {/* Mobile Navigation */}
            <div className="md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <Menu className="h-6 w-6" />
                </button>

                {/* Overlay (fondo oscuro) */}
                {isMenuOpen && (
                    <div 
                    className="fixed inset-0 bg-black/40 z-40"
                    onClick={() => setIsMenuOpen(false)}
                    ></div>
                )}

                {/* Sidebar Menu */}
                <div
                    className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
                    isMenuOpen ? "translate-x-0" : "translate-x-full"
                    }`}
                >
                    <div className="flex flex-col space-y-4 mt-12 px-6">
                    <Link
                        to={"#banner"}
                        className="text-lg text-gray-700 hover:text-orange-600"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Home
                    </Link>
                    <Link
                        to={"#about"}
                        className="text-lg text-gray-700 hover:text-orange-600"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Sobre Nosotros
                    </Link>
                    <Link
                        to={"#services"}
                        className="text-lg text-gray-700 hover:text-orange-600"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Servicios
                    </Link>
                    <Link
                        to={"#contact"}
                        className="text-lg text-gray-700 hover:text-orange-600"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Contacto
                    </Link>
                    </div>
                </div>
            </div>

        </div>
      </nav>

      {/* Banner Section */}
      <section id="banner" className="pt-20 pb-16 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Revoluciona el Menú Digital de tu Restaurante
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Transforma tu restaurante con nuestro sistema inteligente de menú digital. Sincroniza con Google Sheets para actualizaciones instantáneas. ¡No se requieren conocimientos técnicos!
                </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button   className="bg-orange-600 hover:bg-orange-700">
                  <a href={"#contact"} className="text-white font-semibold">
                  Solicitar Demo
                  </a>
                </button>
                <button  onClick={() => setShowDemo(true)}>
                  Ver Demo
                </button>

                {/* Modal Demo */}
                {showDemo && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
                   onClick={() => setShowDemo(false)} 
                  >
                    <div 
                      className="relative bg-transparent"
                      style={{ scale: ( /*smartphon vertical*/window.innerHeight > 800 && window.innerWidth < 800 ? "0.5":
                                        /*pc*/window.innerHeight > 800 && window.innerWidth > 800 ? "0.8":"0.5") }}
                      onClick={e => e.stopPropagation()} 
                    >
                       <div className="flex flex-row gap-2 w-full absolute -top-11 px-6 -left-1">
                        <button 
                          className={"w-1/2 h-10 opacity-80 "+( urlDemo.indexOf("demosp") > 0 ? " bg-slate-700 text-white" : " bg-slate-400  ")+" hover:bg-slate-700 text-center font-bold"}
                          onClick={() => setUrlDemo("https://devadsdemosp.sabore.ar/menu")}
                        >Menu SinglePage
                        </button>
                        <button 
                          className={"w-1/2 h-10 opacity-80 "+( urlDemo.indexOf("demomp") > 0 ? " bg-slate-700 text-white" : " bg-slate-400  ")+" hover:bg-slate-700 text-center font-bold"}
                          onClick={() => setUrlDemo("https://devadsdemomp.sabore.ar/menu")}
                        >Menu MultiPage
                        </button>
                      </div>
                      {/* Smartphone frame */}
                      <div className="mx-auto rounded-3xl border-8 border-gray-800 shadow-2xl bg-black " style={{ width: 540, height: 960}}>
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-2 bg-gray-700 rounded-full"></div>
                          <iframe
                            src={urlDemo} // Cambia por la URL real de tu menú digital
                            title="Demo Menú Digital"
                            className="w-full h-full rounded-2xl"
                            style={{
                              border: "none"
                            }}
                            allowFullScreen
                          />
                      </div>
                      {/* Cerrar */}
                      <button
                        onClick={() => setShowDemo(false)}
                        className="absolute -top-8 -right-5 text-white text-2xl font-bold px-4 py-2"
                        aria-label="Cerrar"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
            <div className="relative">
             {/* <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3">
                <div className="space-y-4">
                  <div className="h-4 bg-orange-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="h-20 bg-orange-100 rounded"></div>
                    <div className="h-20 bg-orange-100 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-green-500 text-white p-3 rounded-full">
                <CheckCircle className="h-6 w-6" />
              </div>*/}
               <img src="/banner_draw.png" alt="Digital Menu" className="w-3/5 h-auto rounded-2xl justify-self-center" />
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Sobre Nuestro Menú Digital</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Estamos revolucionando la gestión de menús en restaurantes con tecnología simple y poderosa que se conecta directamente a Google Sheets.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Por qué creamos Sabore.ar</h3>
                <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-600">
                  Los dueños de restaurantes pierden horas actualizando menús impresos y pantallas digitales.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-600">
                  Los cambios de precios y nuevos platos tardan demasiado en implementarse en todas las plataformas.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-600">
                  Capacitar al personal en sistemas complejos cuesta tiempo y dinero.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-600">
                  Tener múltiples versiones del menú genera confusión y errores.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-100 to-red-100 p-8 rounded-2xl">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Nuestra Solución</h4>
              <p className="text-gray-700 mb-4">
              Sabore.ar conecta tu Google Sheets con menús digitales atractivos. Actualiza una vez, sincroniza en todas partes.
              </p>
              <p className="text-gray-700">
              No se requieren conocimientos técnicos. Si sabes usar una hoja de cálculo, puedes gestionar todo tu sistema de menús.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Nuestros Servicios</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Todo lo que necesitas para modernizar el menú de tu restaurante con integración perfecta a Google Sheets.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="border-0 shadow-lg hover:shadow-xl transition-shadow rounded-xl bg-white p-6">
                <div className="mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <Smartphone className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Menú Digital Atractivo</h3>
                    <p className="text-gray-500">
                    Menús digitales atractivos y responsivos que funcionan en cualquier dispositivo o tamaño de pantalla.
                    </p>
                </div>
                <div>
                    <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Integración código QR</li>
                    <li>• Diseño Optimizado para móviles</li>
                    <li>• Personalización de marca</li>
                    <li>• Capacitación de uso</li>
                    </ul>
                </div>
            </div>

            <div className="border-0 shadow-lg hover:shadow-xl transition-shadow rounded-xl bg-white p-6">
                <div className="mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Settings className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Google Sheets Sync</h3>
                    <p className="text-gray-500">
                    Sincronización en tiempo real con tu Google Sheets para actualizaciones instantáneas del menú.
                    </p>
                </div>
                <div>
                    <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Actualización instantánea de precios</li>
                    <li>• Agrega o elimina platos fácilmente</li>
                    <li>• Cambios masivos en el menú</li>
                    <li>• Control de versiones</li>
                    </ul>
                </div>
            </div>


            <div className="border-0 shadow-lg hover:shadow-xl transition-shadow rounded-xl bg-white p-6">
                <div className="mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <TvMinimal className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Pantalla Dinámica Externa</h3>
                    <p className="text-gray-500">
                    Muestra tu menú digital en pantallas grandes o tablets en el restaurante, sincronizado con Google Sheets.
                    </p>
                </div>
                <div>
                    <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Diseños Animados</li>
                    <li>• Soluciones Personalizables</li>
                    <li>• Gestión centralizada</li>
                    </ul>
                </div>
            </div>

            <div className="border-0 shadow-lg hover:shadow-xl transition-shadow rounded-xl bg-white p-6">
                <div className="mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Paintbrush className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Diseño de cartas QR</h3>
                    <p className="text-gray-500">
                    Crea menús digitales con códigos QR personalizados para que tus clientes accedan fácilmente desde sus dispositivos.
                    </p>
                </div>
                <div>
                    <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Generación de códigos QR</li>
                    <li>• Diseño de cartas QR personalizadas</li>
                    <li>• Integración con menús digitales</li>
                    <li>• Fácil acceso para clientes</li>
                    </ul>
                </div>
            </div>


            {/*<Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Analytics & Insights</CardTitle>
                <CardDescription>
                  Track menu performance and customer preferences with detailed analytics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Popular items tracking</li>
                  <li>• View statistics</li>
                  <li>• Performance reports</li>
                  <li>• Customer insights</li>
                </ul>
              </CardContent>
            </Card>*/}

            <div className="border-0 shadow-lg hover:shadow-xl transition-shadow rounded-xl bg-white p-6">
                <div className="mb-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-yellow-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Soporte de Calidad</h3>
                    <p className="text-gray-500">
                    Asistencia completa en la configuración y soporte continuo para que tus menús funcionen sin problemas.
                    </p>
                </div>
                <div>
                    <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Asistencia técnica</li>
                    <li>• Asistencia de uso</li>
                    <li>• Actualizaciones regulares</li>
                    </ul>
                </div>
            </div>

          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Comienza Hoy</h2>
          <p className="text-xl text-gray-600">
            ¿Listo para revolucionar el menú de tu restaurante? Contáctanos para una consulta gratuita.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">¿Por qué elegir Sabore.ar?</h3>
            <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-orange-600" />
            </div>
            <span className="text-gray-700">Instalacion y Capacitacion</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-orange-600" />
            </div>
            <span className="text-gray-700">Soporte técnico</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-orange-600" />
            </div>
            <span className="text-gray-700">Facil de Utilizar</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-orange-600" />
            </div>
            <span className="text-gray-700">Garantía de devolución de 30 días</span>
          </div>
            </div>
          </div>

<div className="border-0 shadow-xl rounded-2xl bg-white p-6">
    <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Contáctanos</h2>
        <p className="text-gray-600">
        Completa el formulario y te responderemos en menos de 24 horas.
        </p>
    </div>

    <div>
            {success ? (
            <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                ¡Gracias por tu interés!
                </h3>
                <p className="text-gray-600">
                Nos pondremos en contacto contigo pronto.
                </p>
            </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nombre *
                    </label>
                    <input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 p-2 focus:border-orange-500 focus:ring focus:ring-orange-200"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Correo electrónico *
                    </label>
                    <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 p-2 focus:border-orange-500 focus:ring focus:ring-orange-200"
                    />
                </div>
                </div>

                <div>
                <label htmlFor="restaurant" className="block text-sm font-medium text-gray-700">
                    Nombre del restaurante
                </label>
                <input
                    id="restaurant"
                    name="restaurant"
                    value={formData.restaurant}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 p-2 focus:border-orange-500 focus:ring focus:ring-orange-200"
                />
                </div>

                <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Teléfono
                </label>
                <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 p-2 focus:border-orange-500 focus:ring focus:ring-orange-200"
                />
                </div>

                <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Mensaje
                </label>
                <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Cuéntanos sobre tu restaurante y cómo podemos ayudarte..."
                    className="mt-1 block w-full rounded-lg border border-gray-300 p-2 focus:border-orange-500 focus:ring focus:ring-orange-200"
                />
                </div>

                <button
                type="submit"
                className="w-full rounded-lg bg-orange-600 px-4 py-2 text-white font-semibold hover:bg-orange-700 transition"
                >
                Enviar mensaje
                </button>
            </form>
            )}
        </div>
    </div>

        </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
            <div className="text-2xl font-bold text-orange-400 mb-4">Sabore.ar</div>
            <p className="text-gray-400 mb-4">Revolucionando los menús de restaurantes con integración a Google Sheets</p>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Sabore.ar. Todos los derechos reservados.
            </p>
          
        </div>
      </footer>

      {/* Floating WhatsApp button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
        aria-label="Contact us on WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </div>
  )
}
