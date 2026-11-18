import { useState } from 'react'
import { FlatList, Image, Text, View } from 'react-native'

export const ProductList = ({ products }) => {
    const [filter, setFilter] = useState('')
    return (
        <FlatList
            data={products.filter(p => p.name.includes(filter))}
            renderItem={({ item }) => (
                <View style={{ flexDirection: 'row', padding: 10 }}>
                    <Image source={{ uri: item.imageUrl }} style={{ width: 80, height: 80 }} />
                    <View>
                        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.name}</Text>
                        <Text>{item.price} €</Text>
                    </View>
                </View>
            )}
            onEndReached={() => console.log('end')}
        />
    )
}