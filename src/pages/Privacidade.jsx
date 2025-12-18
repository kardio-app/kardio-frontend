import { useEffect } from 'react'
import Navbar from '../components/Navbar/Navbar'
import './Legal.css'

function Privacidade() {
  useEffect(() => {
    document.title = 'Privacidade - kardio'
  }, [])

  return (
    <>
      <Navbar />
      <div className="legal-page">
        <div className="legal-container">
          <h1 className="legal-title">Política de Privacidade</h1>
          <div className="legal-content">
            <p className="legal-intro">
              Esta Política de Privacidade descreve como o kardio coleta, usa e protege suas informações pessoais.
            </p>

            <section className="legal-section">
              <h2 className="legal-section-title">1. Informações que Coletamos</h2>
              <p>
                Coletamos informações que você nos fornece diretamente ao usar nossos serviços, incluindo dados de projetos e tarefas que você cria.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">2. Como Usamos suas Informações</h2>
              <p>
                Utilizamos suas informações para fornecer, manter e melhorar nossos serviços, processar suas solicitações e comunicar-nos com você.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">3. Compartilhamento de Informações</h2>
              <p>
                Não vendemos suas informações pessoais. Podemos compartilhar informações apenas conforme descrito nesta política ou com seu consentimento.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">4. Segurança</h2>
              <p>
                Implementamos medidas de segurança para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">5. Seus Direitos</h2>
              <p>
                Você tem o direito de acessar, corrigir ou excluir suas informações pessoais a qualquer momento.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">6. Alterações nesta Política</h2>
              <p>
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre alterações significativas.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">7. Contato</h2>
              <p>
                Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco através dos canais disponíveis no rodapé do site.
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

export default Privacidade

