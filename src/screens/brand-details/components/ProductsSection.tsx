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
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
    marginRight: 16,
    width: 80,
    textAlign: 'left',
  },
  productsList: {
    flex: 1,
  },
  productText: {
    fontSize: 15,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.black,
    lineHeight: 20,
  },
});

export default ProductsSection;

