import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import CustomImage from './CustomImage'; // Adjust path accordingly
import { resWidth, scaleSize } from '../../utils/responsive'; // Adjust path accordingly
import { assets, icons } from '../../utils/AppImages'; // Adjust path accordingly

export default function StarRating({ rating = 2, style, disable, starView, onRatingChange }: any) {
  const [MaxRating] = useState([1, 2, 3, 4, 5]);
  const [defaultRating, setDefaultRating] = useState(rating);

  useEffect(() => {
    setDefaultRating(rating);
  }, [rating]);

  const handleRating = (selectedRating: number) => {
    setDefaultRating(selectedRating);
    if (onRatingChange) {
      onRatingChange(selectedRating); // Send updated rating to parent
    }
  };

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          justifyContent: 'flex-start',
          marginVertical: scaleSize(20),
        },
        starView,
      ]}
    >
      {MaxRating.map((item) => (
        <TouchableOpacity
          disabled={disable || false}
          key={item}
          onPress={() => handleRating(item)}
        >
          <CustomImage
            style={[
              {
                height: resWidth(6),
                width: resWidth(6),
                marginRight: resWidth(3),
              },
              style,
            ]}
            source={item <= defaultRating ? assets.star : assets.unfillStar}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}
