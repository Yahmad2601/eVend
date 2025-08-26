import { Card, CardContent } from "@/components/ui/card";
import type { Drink } from "@shared/schema";

interface DrinkCardProps {
  drink: Drink;
  onSelect: (drink: Drink) => void;
}

export default function DrinkCard({ drink, onSelect }: DrinkCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow duration-200 bg-white rounded-xl"
      onClick={() => onSelect(drink)}
      data-testid={`card-drink-${drink.id}`}
    >
      <CardContent className="p-4">
        <img
          src={drink.imageUrl}
          alt={drink.name}
          className="w-full h-32 object-cover rounded-lg mb-3"
          loading="lazy"
        />
        <h3 className="font-medium text-gray-800 text-sm" data-testid={`text-drink-name-${drink.id}`}>
          {drink.name}
        </h3>
        <p className="text-primary font-semibold text-sm" data-testid={`text-drink-price-${drink.id}`}>
          ₦ {drink.price}
        </p>
      </CardContent>
    </Card>
  );
}
