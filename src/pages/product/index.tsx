import Head from 'next/head'
import { canSSRAuth } from '../../utils/canSSRAuth'
import styles from './styles.module.scss'
import { Header } from '../../components/Header'
import { FiUpload } from 'react-icons/fi'
import { ChangeEvent, FormEvent, useState } from 'react'

import { setupAPIClient } from '../../services/api'
import { toast } from 'react-toastify'


type ItemProps={
    id:string
    name:string

}

interface CategoryProps{
    categoryList:ItemProps[];
}


export default function product( {categoryList}:CategoryProps) {

    //console.log(categoryList)

    const [name, setName] = useState('')
    const [price, setPrice] = useState('')
    const [description, setDescription] = useState('')

    const [avatarUrl, setAvatarUrl] = useState('');
    const [imageAvatar, setImageAvatar] = useState(null)

    const [categories, setCategories] = useState(categoryList || [])
    const [categorySelectd, setCategorySelectd] = useState(0)


    function handleFile(e:ChangeEvent<HTMLInputElement>) {
       // console.log(e.target.files)
       if(!e.target.files){
        return
       }

       const image = e.target.files[0]

       if(!image){
        return
       }

       if(image.type ==='image/jpeg' || image.type ==='image/png'){
        setImageAvatar(image)
        setAvatarUrl(URL.createObjectURL(e.target.files[0]))

       }
    }

    //Chama quando seleciona uma nova categoria na lista
    function handleChangeCategory(event){
            setCategorySelectd(event.target.value)
    }

    async function handleRegister(event:FormEvent){
        event.preventDefault();

        try{
            const data = new FormData()

            if(name === '' || price ==='' || description ==='' || imageAvatar ===null){
                toast.error('Preencha todos os campos')
                return
            }

            data.append('name', name)
            data.append('price', price)
            data.append('description', description)
            data.append('category_id', categories[categorySelectd].id)
            data.append('file',imageAvatar)

            const apiCLient = setupAPIClient()

            await apiCLient.post('/product', data)

            toast.success('Cadastrado com sucesso')



        }catch(err){
            console.log(err)
            toast.error('Erro ao cadastrar')
        }

        setName('')
        setPrice('')
        setDescription('')
        setImageAvatar(null)
        setAvatarUrl('')
        

    }
    

    return(
        <>
            <Head>
                <title>Novo Produto</title>
            </Head>

            <div>
                <Header/>

                <main className={styles.container}>
                    <h1>Novo Produto</h1>

                    <form className = {styles.form} onSubmit={handleRegister}>

                        <label className={styles.labelAvatar}>
                            <span>
                                <FiUpload size={25} color='#fff'/>
                            </span>
                            
                            <input type='file' accept = 'image/png, image/jpeg' onChange={handleFile}/>

                            {avatarUrl && (
                                <img
                                className={styles.preview}
                                src={avatarUrl}
                                alt='Foto do produto'
                                width={250}
                                height={250}
                                />
                            )}

                        </label>
                    
                        <select value={categorySelectd} onChange={handleChangeCategory}>
                                {categories.map( (item, index) => {
                                    return(
                                        <option key={item.id} value={index}>
                                            {item.name}

                                        </option>
                                    )
                                })}

                        </select>

                        <input
                        type='text'
                        placeholder='Nome do Produto'
                        className={styles.input}
                        value={name}
                        onChange={(e)=> setName(e.target.value)}
                        
                        />
                        
                        <input
                        type='text'
                        placeholder='Preço'
                        className={styles.input}
                        value={price}
                        onChange={(e)=> setPrice(e.target.value)}
                        />
                        
                        <textarea
                        placeholder='Descrição'
                        className={styles.input}
                        value={description}
                        onChange={(e)=> setDescription(e.target.value)}
                        />
                        
                        <button className={styles.buttonAdd} type="submit">
                        Cadastrar 
                        </button>

                    </form>
                </main>
            </div>
        </>
    )
}


export const getServerSideProps = canSSRAuth(async (ctx) => {
    const apiCLient = setupAPIClient(ctx)

    const response = await apiCLient.get('/category')

    //console.log(response.data)

    return {
        props:{
            categoryList: response.data
        }
    }
    
})