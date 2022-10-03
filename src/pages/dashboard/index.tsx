import Head from "next/head"
import { canSSRAuth } from "../../utils/canSSRAuth"
import { Header } from '../../components/Header'
import { ModalOrder } from '../../components/ModalOrder'


import styles from './styles.module.scss'
import { FiRefreshCcw } from "react-icons/fi"
import { setupAPIClient } from "../../services/api"
import { useState } from "react"
import Modal from "react-modal"

interface HomeProps{
    orders:OrderProps[]
}

type OrderProps = {
        id: string
		table: string|number
		status: boolean
		draft: boolean
		name: string|null
		
}

export type OrderItemProps = {
    id:string
    amount:number
    order_id:string
    product_id:string
    product:{
        id: string
        name:string
		description:string
        price:string
        banner:string
    }
    order:OrderProps
}




export default function Dashboard({orders}:HomeProps){

    const [orderList, setOrderList] = useState(orders || [])

    const [modalItem, setModalItem] = useState<OrderItemProps[]>()
    const [modalVisible, setModalVisible] = useState(false)

    function handleCloseModal(){
        setModalVisible(false)
    }

    async function handleOpenModalView(id:string) {
        //alert('ID' + id)
        const apiCLient = setupAPIClient();
        const response = await apiCLient.get('/order/detail',{
            params:{
                order_id:id
            }
        })

        setModalItem(response.data)
        setModalVisible(true)
        
    }

    async function handleFinishItem(id:string){
        //alert(id)
        const apiCLient = setupAPIClient()
        await apiCLient.put('/order/finish',{
            order_id:id
            
        })

        const response = await apiCLient.get('/orders')
        setOrderList(response.data)
        setModalVisible(false)

    }

    async function handleRefreshOrders(){
        const apiCLient = setupAPIClient()
        const response = await apiCLient.get('/orders')
        setOrderList(response.data)
    }


    Modal.setAppElement('#__next')
    
    return(
        <>
            <Head>
                <title>Painel - Sujeito Pizzaria</title>
            </Head>
            <div>
                <Header/>
                
                <main className={styles.container}>
                    <div className={styles.containerHeader}>
                        <h1>Pedidos</h1>
                        <button onClick={handleRefreshOrders}>
                            <FiRefreshCcw color="#3fffa3" size={25}/>
                        </button>
                    </div>

                    <article className={styles.listOrders}>
                        {orderList.length ===0 &&(
                            <span className={styles.emptyList}>
                            <strong>Nenhum pedido aberto neste momento</strong>
                            </span>
                        )}

                        {orderList.map( item =>(

                            <section key={item.id} className={styles.orderItems}>
                            <button onClick={ () => handleOpenModalView(item.id)}>
                                <div className={styles.tag}></div>
                                <span>Mesa {item.table}</span>
                                
                            </button>
                            </section>

                        ))}

                        
                        
                        

                    </article>

                </main>
                { modalVisible &&(
                    <ModalOrder
                        isOpen={modalVisible}
                        onRequestClose={handleCloseModal}
                        order={modalItem}
                        handleFinishOrder = {handleFinishItem}
                    />
                )}
            </div>
        </>
    )
}

export const getServerSideProps = canSSRAuth(async (ctx) => {
    const apiCLient = setupAPIClient(ctx)

    const response = await apiCLient.get('/orders')

    //console.log(response.data)
    return{
        props:{
            orders: response.data
        }
    }
})