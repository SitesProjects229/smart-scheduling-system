import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQSection() {
  const faqs = [
    {
      question: "Насколько безопасна процедура SynapseAI?",
      answer:
        "Да, процедура выполняется прецизионным хирургическим роботом и прошла обширное тестирование. Все материалы биосовместимы и одобрены FDA для медицинского применения.",
    },
    {
      question: "Сколько длится операция?",
      answer:
        "Малоинвазивная процедура обычно занимает 2-3 часа и проводится под местной анестезией с седацией.",
    },
    {
      question: "Можно ли удалить устройство?",
      answer:
        "Да, SynapseAI разработан полностью обратимым. Устройство можно безопасно удалить при необходимости, хотя это требуется редко.",
    },
    {
      question: "Какие ощущения при использовании SynapseAI?",
      answer:
        "Пользователи отмечают, что управление устройствами силой мысли ощущается естественно и интуитивно после короткого периода обучения. От самого импланта нет физических ощущений.",
    },
    {
      question: "Как долго работает батарея?",
      answer:
        "Устройство заряжается беспроводным способом и работает полный день на одном заряде. Зарядка выполняется внешним устройством, размещаемым рядом с головой.",
    },
    {
      question: "Кто может получить SynapseAI?",
      answer:
        "В настоящее время мы фокусируемся на людях с тяжелым параличом. Соответствие определяется через комплексную медицинскую оценку.",
    },
  ]

  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-orbitron">Частые вопросы</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto font-space-mono">
            Ответы на популярные вопросы о технологии SynapseAI, безопасности и опыте пациентов.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-red-500/20 mb-4">
                <AccordionTrigger className="text-left text-lg font-semibold text-white hover:text-red-400 font-orbitron px-6 py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-300 leading-relaxed px-6 pb-4 font-space-mono">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
