import { useMemo, useState } from 'react'
import { FlatList, Image, Text, View } from 'react-native'

type Product = {
    id: string
    name: string
    price: number
    imageUrl: string
}



export const ProductList = ({ products }: { products: Product[] }) => {
    const [filter, setFilter] = useState('')

    const filteredProducts = useMemo(() => products.filter(p => p.name.includes(filter)), [products, filter])

    return (
        <FlatList
            data={filteredProducts}
            keyExtractor={keyExtractor}
            renderItem={({ item }) => <ProductItem product={item} />}
            onEndReached={() => console.log('end')}
        />
    )
}

const ProductItem = ({ product }: { product: Product }) => {
    return (
        <View style={{ flexDirection: 'row', padding: 10 }}>
            <Image source={{ uri: product.imageUrl }} style={{ width: 80, height: 80 }} />
            <View>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{product.name}</Text>
                <Text>{product.price} €</Text>
            </View>
        </View>
    )
}


const keyExtractor = (item: Product): string => item.id