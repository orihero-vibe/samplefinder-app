import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface ProductsSectionProps {
  products: string[];
}

const ProductsSection: React.FC<ProductsSectionProps> = ({ products }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>PRODUCTS:</Text>
      <View style={styles.productsList}>
        {products.map((product, index) => (
          <Text key={index} style={styles.productText}>
            {product}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
    marginRight: 12,
    minWidth: 100,
    flex: 1,
    textAlign: 'right',
  },
  productsList: {
    flex: 10,
  },
  productText: {
    fontSize: 16,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.black,
  },
});

export default ProductsSection;

