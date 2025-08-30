// client/src/components/DrinkCard.tsx

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import type { Drink } from "@shared/schema";

interface DrinkCardProps {
  drink: Drink;
  onSelect: (drink: Drink) => void;
}

export default function DrinkCard({ drink, onSelect }: DrinkCardProps) {
  // The 'motion(Card)' syntax is deprecated.
  // The fix is to use motion.div and apply the Card's styles to it.
  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.97 }}
      className="cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200/80"
      onClick={() => onSelect(drink)}
      data-testid={`card-drink-${drink.id}`}
    >
      <CardContent className="p-0">
        <div className="h-28 overflow-hidden relative">
          <img
            src={drink.imageUrl}
            alt={drink.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div
            className="absolute bottom-2 right-2 bg-secondary text-white text-xs font-bold px-2 py-1 rounded-full"
            data-testid={`text-drink-price-${drink.id}`}
          >
            ₦{drink.price}
          </div>
        </div>
        <div className="p-3">
          <h3
            className="font-semibold text-gray-800 text-sm truncate"
            data-testid={`text-drink-name-${drink.id}`}
          >
            {drink.name}
          </h3>
        </div>
      </CardContent>
    </motion.div>
  );
}
