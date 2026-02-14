import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const features = [
  {
    title: "Адаптивная нейрообработка",
    description: "Самооптимизирующиеся алгоритмы, которые обучаются на нейронных паттернах и улучшают интерпретацию сигналов.",
    icon: "brain",
    badge: "ИИ",
  },
  {
    title: "Медицинская защита",
    description: "Шифрование по стандартам FDA со сквозной защитой конфиденциальных нейронных данных.",
    icon: "lock",
    badge: "Сертификат",
  },
  {
    title: "Интуитивное управление",
    description: "Естественная трансляция мыслей в действия с откликом менее миллисекунды и точностью 99,7%.",
    icon: "globe",
    badge: "Точность",
  },
  {
    title: "Предиктивная калибровка",
    description: "ML-модели, которые предугадывают намерения пользователя и оптимизируют нейронные пути.",
    icon: "zap",
    badge: "Умный",
  },
  {
    title: "Биометрическая интеграция",
    description: "Бесшовная синхронизация с мониторингом жизненных показателей для контроля здоровья.",
    icon: "link",
    badge: "Связь",
  },
  {
    title: "Поддержка XR",
    description: "Нативная совместимость с AR/VR-средами для терапевтических и рабочих приложений.",
    icon: "target",
    badge: "XR Ready",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4 font-sans">Возможности нового поколения</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Почувствуйте будущее с технологиями, которые переопределяют возможное
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="glow-border hover:shadow-lg transition-all duration-300 slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">
                    {feature.icon === "brain" && "&#129504;"}
                    {feature.icon === "lock" && "&#128274;"}
                    {feature.icon === "globe" && "&#127760;"}
                    {feature.icon === "zap" && "&#9889;"}
                    {feature.icon === "link" && "&#128279;"}
                    {feature.icon === "target" && "&#127919;"}
                  </span>
                  <Badge variant="secondary" className="bg-accent text-accent-foreground">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold text-card-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
