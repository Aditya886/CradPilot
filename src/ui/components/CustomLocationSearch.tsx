import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  Platform,
} from 'react-native';
import { font14, font16 } from '../../utils/fontSizes';
import { colors } from '../../utils/colors';
import { scaleSize } from '../../utils/responsive';
import CustomText from './CustomText';

type PlacePrediction = {
  description: string;
  place_id: string;
  structured_formatting?: { main_text?: string; secondary_text?: string };
};

type PlaceDetails = {
  place_id: string;
  name?: string;
  formatted_address?: string;
  geometry?: { location: { lat: number; lng: number } };
};

type Props = {
  apiKey: string;
  onPlaceSelected: (place: PlaceDetails) => void;
  placeholder?: string;
  minLength?: number;
  debounce?: number;
  country?: string;
  styles?: Partial<Record<string, any>>;
  fetchDetails?: boolean;
};

const defaultProps: Partial<Props> = {
  placeholder: 'Search places',
  minLength: 2,
  debounce: 200, // Reduced from 300ms for faster response
  fetchDetails: true,
};

function makeSessionToken() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const CustomLocationSearch: React.FC<Props> = (props) => {
  const {
    apiKey,
    onPlaceSelected,
    placeholder = "Search your location",
    minLength,
    debounce,
    country,
    styles: userStyles,
    fetchDetails,
  } = { ...defaultProps, ...props } as Props;

  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showList, setShowList] = useState(false);
  const tokenRef = useRef<string>(makeSessionToken());
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const fetchPredictions = useCallback(async (input: string) => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    setLoading(true);

    try {
      const base = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
      const params = new URLSearchParams({
        input,
        key: apiKey,
        sessiontoken: tokenRef.current,
      } as any);

      if (country) params.append('components', `country:${country}`);

      const url = `${base}?${params.toString()}`;
      const res = await fetch(url, { 
        signal: abortControllerRef.current.signal 
      });
      
      const json = await res.json();

      if (json && json.predictions) {
        setPredictions(json.predictions);
        setShowList(true);
      } else {
        setPredictions([]);
        setShowList(false);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Places autocomplete error', err);
        setPredictions([]);
        setShowList(false);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [apiKey, country]);

  useEffect(() => {
    if (query.length < (minLength || 2)) {
      setPredictions([]);
      setShowList(false);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchPredictions(query);
    }, debounce);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, debounce, minLength, fetchPredictions]);

  const fetchPlaceDetails = useCallback(async (place_id: string): Promise<PlaceDetails | null> => {
    try {
      const base = 'https://maps.googleapis.com/maps/api/place/details/json';
      const params = new URLSearchParams({
        place_id,
        key: apiKey,
        sessiontoken: tokenRef.current,
        fields: 'place_id,name,formatted_address,geometry',
      } as any);
      const url = `${base}?${params.toString()}`;
      const res = await fetch(url);
      const json = await res.json();
      
      if (json && json.result && json.result.geometry?.location) {
        return json.result as PlaceDetails;
      }
      
      return null;
    } catch (err) {
      console.warn('Place details error', err);
      return null;
    }
  }, [apiKey]);

  const handleSelect = useCallback(async (prediction: PlacePrediction) => {
    Keyboard.dismiss();
    setShowList(false);
    setQuery(prediction.description);

    // Create new session token for next query
    tokenRef.current = makeSessionToken();

    if (fetchDetails) {
      const details = await fetchPlaceDetails(prediction.place_id);
      if (details && details.geometry?.location) {
        // Ensure lat/lng are properly extracted
        const placeData: PlaceDetails = {
          place_id: details.place_id,
          name: details.name || prediction.description,
          formatted_address: details.formatted_address,
          geometry: {
            location: {
              lat: details.geometry.location.lat,
              lng: details.geometry.location.lng,
            }
          }
        };
        onPlaceSelected(placeData);
      } else {
        // Fallback without coordinates
        console.warn('Unable to fetch place details with coordinates');
        onPlaceSelected({ 
          place_id: prediction.place_id, 
          name: prediction.description 
        });
      }
    } else {
      onPlaceSelected({ 
        place_id: prediction.place_id, 
        name: prediction.description 
      });
    }
  }, [fetchDetails, fetchPlaceDetails, onPlaceSelected]);

  const renderItem = useCallback(({ item }: { item: PlacePrediction }) => {
    const main = item.structured_formatting?.main_text || item.description;
    const secondary = item.structured_formatting?.secondary_text || '';
    return (
      <TouchableOpacity 
        style={[styles.item, userStyles?.item]} 
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <CustomText variant="subtitle" style={[styles.mainText, userStyles?.mainText]} numberOfLines={1}>
          {main}
        </CustomText>
        {secondary ? (
          <CustomText variant="caption" style={[styles.secondaryText, userStyles?.secondaryText]} numberOfLines={1}>
            {secondary}
          </CustomText>
        ) : null}
      </TouchableOpacity>
    );
  }, [handleSelect, userStyles]);

  return (
    <View style={[styles.container, userStyles?.container]}>
      <View style={[styles.inputRow, userStyles?.inputRow]}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          allowFontScaling={false}
          maxFontSizeMultiplier={1}
          placeholder={placeholder}
          placeholderTextColor={colors.textBlack41}
          style={[styles.input, userStyles?.input]}
          underlineColorAndroid="transparent"
          clearButtonMode="while-editing"
          autoCorrect={false}
          autoCapitalize="none"
          onFocus={() => {
            if (predictions.length > 0) setShowList(true);
          }}
        />
        {loading ? <ActivityIndicator style={styles.loader} /> : null}
      </View>

      {showList && predictions.length > 0 ? (
        <View style={[styles.listContainer, userStyles?.listContainer]}>
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={predictions}
            keyExtractor={(i) => i.place_id}
            renderItem={renderItem}
            // style={{ maxHeight: 250 }}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={8}
          />
        </View>
      ) : null}
    </View>
  );
};

export default CustomLocationSearch;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.bgColor,
    borderRadius: scaleSize(9),
    marginVertical: scaleSize(10),
    marginHorizontal: scaleSize(10),
    paddingHorizontal: scaleSize(15),
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    fontSize: font16,
    color: colors.textBlack,
    // borderWidth:1,
    // borderColor: colors.borderColor,
    // borderRadius:8,
    height: scaleSize(30),
    // backgroundColor:'red',
    padding: 0,
  },
  loader: {
    marginLeft: 8,
  },
  listContainer: {
    borderColor: '#ddd',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: scaleSize(8),
    marginVertical: scaleSize(6),
    marginHorizontal: scaleSize(10),
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f1f1f1',
  },
  mainText: {
  },
  secondaryText: {
    color: '#666',
    marginTop: 3,
  },
});
