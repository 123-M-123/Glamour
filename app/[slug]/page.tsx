import { Metadata } from "next"
import { seoPages } from "@/data/seo-glamour"
import Link from "next/link"
import { MessageCircle, ChevronLeft } from "lucide-react"
import { C } from "@/styles/colores" // ✅ Ruta relativa estándar

type Props = {
  params: { slug: string }
}

const reserved = ['sitemap.xml', 'robots.txt', 'favicon.ico', 'icons']

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params
  if (reserved.includes(slug)) return {}

  const pageData = seoPages.find(p => p.slug === slug)
  const titleText = pageData ? pageData.title : slug.replace(/-/g, ' ').toUpperCase()

  return {
    title: `${titleText} | Glamour Urquiza`,
    description: pageData?.content || `Explorá nuestra colección de ${titleText} en Glamour Urquiza. Vestite como querés sentirte.`,
  }
}

export default function SlugPage({ params }: Props) {
  const { slug } = params
  if (reserved.includes(slug)) return null

  const pageData = seoPages.find(p => p.slug === slug)
  const displayTitle = pageData ? pageData.h1 : slug.replace(/-/g, ' ').toUpperCase()
  const displayContent = pageData ? pageData.content : `¿Estás buscando ${displayTitle.toLowerCase()}? En Glamour Urquiza ofrecemos indumentaria femenina actual, versátil y de calidad.`

  const whatsappUrl = `https://wa.me/5491167914366?text=Hola! Vi la página de ${displayTitle} y quería consultar por stock.`

  return (
    <main style={{ 
      padding: '120px 20px', 
      textAlign: 'center', 
      minHeight: '100vh',
      background: 'var(--background)' 
    }}>
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto', 
        background: 'white', 
        padding: '40px', 
        borderRadius: '20px', 
        border: `2px solid ${C.primary}` 
      }}>
        
        <h1 style={{ color: C.primary, fontSize: '28px', marginBottom: '20px' }}>
          {displayTitle}
        </h1>

        <p style={{ color: '#444', lineHeight: '1.6', marginBottom: '30px', fontSize: '18px' }}>
          {displayContent}
        </p>

        <p style={{ color: '#666', marginBottom: '40px' }}>
          Consultanos por disponibilidad, talles y puntos de retiro en Villa Urquiza o envíos a todo el país.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: '#25D366',
              color: 'white',
              padding: '15px 25px',
              borderRadius: '50px',
              textDecoration: 'none',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <MessageCircle size={24} />
            CONSULTAR POR WHATSAPP
          </a>

          <Link href="/indumentaria" style={{ 
            color: C.primary, 
            fontWeight: 'bold', 
            textDecoration: 'none', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '5px' 
          }}>
            <ChevronLeft size={20} />
            VER TODA LA TIENDA
          </Link>
        </div>
      </div>
    </main>
  )
}