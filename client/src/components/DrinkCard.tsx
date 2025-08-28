import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import type { Drink } from "@shared/schema";

interface DrinkCardProps {
  drink: Drink;
  onSelect: (drink: Drink) => void;
}

export default function DrinkCard({ drink, onSelect }: DrinkCardProps) {
  const MotionCard = motion(Card);
  return (
    <MotionCard
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.97 }}
      className="cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200/80"
      onClick={() => onSelect(drink)}
      data-testid={`card-drink-${drink.id}`}
    >
      <CardContent className="p-0">
        <div className="h-28 overflow-hidden">
          <img
            src={drink.imageUrl}
            alt={drink.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="p-3">
          <h3
            className="font-semibold text-gray-800 text-sm truncate"
            data-testid={`text-drink-name-${drink.id}`}
          >
            {drink.name}
          </h3>
          <p
            className="text-secondary font-bold text-base"
            data-testid={`text-drink-price-${drink.id}`}
          >
            ₦ {drink.price}
          </p>
        </div>
      </CardContent>
    </MotionCard>
  );
}
