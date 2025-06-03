import { useCallback, useEffect, useState } from 'react'

const useFetchProducts = () => {
  const [products, setProducts] = useState([])

  const fetchProducts = useCallback(async()=>{
    try {
      const response = await fetch('/api/v1/products', {method:'GET'})
      const responsedata = await response.json()
      const {success, data, error} = responsedata
      if(success && data && !error){
        setProducts([...data])
      }else{
        shopify.toast.show(error,{duration: 5000, isError: true})
      }
    } catch (error) {
      shopify.toast.show(error, {duration: 5000, isError: true})
    }
  },[])
  useEffect(()=>{
    fetchProducts()
  },[fetchProducts])

  return {products}
}

export default useFetchProducts