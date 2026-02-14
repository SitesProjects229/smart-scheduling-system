import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const testimonials = [
  {
    name: "Елена Родригес",
    role: "Директор по нейронауке, Quantum Dynamics",
    avatar: "/professional-woman-scientist.png",
    content:
      "SynapseAI изменил наш подход к нейрореабилитации. Результаты пациентов улучшились на 340% после внедрения.",
  },
  {
    name: "Маркус Уильямс",
    role: "Руководитель исследований, Stellar Analytics",
    avatar: "/cybersecurity-expert-man.jpg",
    content:
      "Точность и протоколы безопасности не имеют аналогов. Мы значительно ускорили клинические испытания с платформой SynapseAI.",
  },
  {
    name: "Анна Ковальски",
    role: "Вице-президент по разработке, Nova Industries",
    avatar: "/asian-woman-tech-developer.jpg",
    content:
      "Интеграция прошла безупречно. Адаптивные алгоритмы понимают намерения пользователя лучше любой системы, что мы тестировали.",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-24 px-6 bg-card">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-card-foreground mb-4 font-sans">Нам доверяют лидеры</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Что говорят лидеры индустрии о нашей революционной технологии
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="glow-border slide-up" style={{ animationDelay: `${index * 0.15}s` }}>
              <CardContent className="p-6">
                <p className="text-card-foreground mb-6 leading-relaxed italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                    <AvatarFallback>
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-primary">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
