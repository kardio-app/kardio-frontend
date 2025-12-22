import { useEffect } from 'react'
import Navbar from '../components/Navbar/Navbar'
import './Legal.css'

function Termos() {
  useEffect(() => {
    document.title = 'Termos de Uso - @kardiosoftware'
  }, [])

  return (
    <>
      <Navbar />
      <div className="legal-page">
        <div className="legal-container">
          <h1 className="legal-title">Termos de Uso</h1>
          <div className="legal-content">
            <p className="legal-intro">
              Ao usar o kardio, você concorda com estes Termos de Uso. Leia-os cuidadosamente antes de usar nossos serviços.
            </p>

            <section className="legal-section">
              <h2 className="legal-section-title">1. Aceitação dos Termos</h2>
              <p>
                Ao acessar e usar o kardio, você aceita e concorda em cumprir estes Termos de Uso e todas as leis e regulamentos aplicáveis.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">2. Uso do Serviço</h2>
              <p>
                Você concorda em usar o kardio apenas para fins legais e de acordo com estes Termos. Não deve usar o serviço de forma que possa danificar, desabilitar ou sobrecarregar nossos servidores.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">3. Conta do Usuário</h2>
              <p>
                Você é responsável por manter a confidencialidade de suas informações de acesso e por todas as atividades que ocorrem sob sua conta.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">4. Propriedade Intelectual</h2>
              <p>
                Todo o conteúdo do kardio, incluindo textos, gráficos, logos e software, é propriedade do kardio ou de seus fornecedores de conteúdo e está protegido por leis de direitos autorais.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">5. Limitação de Responsabilidade</h2>
              <p>
                O kardio é fornecido "como está" sem garantias de qualquer tipo. Não nos responsabilizamos por danos diretos, indiretos ou consequenciais resultantes do uso do serviço.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">6. Modificações do Serviço</h2>
              <p>
                Reservamo-nos o direito de modificar ou descontinuar o serviço a qualquer momento, com ou sem aviso prévio.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-section-title">7. Alterações nos Termos</h2>
              <p>
                Podemos revisar estes Termos de Uso a qualquer momento. O uso continuado do serviço após tais alterações constitui sua aceitação dos novos termos.
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

export default Termos

