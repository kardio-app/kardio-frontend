import { useEffect } from 'react'
import Navbar from '../components/Navbar/Navbar'
import './Legal.css'

function Cookies() {
  useEffect(() => {
    document.title = 'Política de Cookies - kardio'
  }, [])

  return (
    <>
      <Navbar />
      <div className="legal-page">
        <div className="legal-container">
          <h1 className="legal-title">Política de Cookies</h1>
          <div className="legal-content">
            <p className="legal-intro">
              Esta Política de Cookies explica o que são cookies, como os usamos e como você pode gerenciá-los.
            </p>

            <section className="legal-section">
              <h2 className="legal-section-title">1. O que são Cookies</h2>
              <p>
                Cookies são pequenos arquivos de texto armazenados em seu dispositivo quando você visita um site. Eles ajudam o site a lembrar suas preferências e melhorar sua experiência.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">2. Como Usamos Cookies</h2>
              <p>
                Utilizamos cookies para lembrar suas preferências de tema, manter você conectado e melhorar a funcionalidade do site.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">3. Tipos de Cookies que Usamos</h2>
              <ul className="legal-list">
                <li><strong>Cookies Essenciais:</strong> Necessários para o funcionamento básico do site.</li>
                <li><strong>Cookies de Preferências:</strong> Lembram suas configurações, como tema escolhido.</li>
                <li><strong>Cookies de Funcionalidade:</strong> Permitem que o site forneça funcionalidades aprimoradas.</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">4. Gerenciamento de Cookies</h2>
              <p>
                Você pode controlar e gerenciar cookies através das configurações do seu navegador. No entanto, desabilitar cookies pode afetar a funcionalidade do site.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">5. Cookies de Terceiros</h2>
              <p>
                Atualmente, não utilizamos cookies de terceiros. Se isso mudar no futuro, atualizaremos esta política.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">6. Mais Informações</h2>
              <p>
                Para mais informações sobre como gerenciar cookies, visite as páginas de ajuda do seu navegador.
              </p>
            </section>

            <p className="legal-updated">
              Última atualização: Janeiro de 2025
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Cookies

