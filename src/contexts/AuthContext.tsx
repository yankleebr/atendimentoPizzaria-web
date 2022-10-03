import  Router from "next/router";
import { destroyCookie,setCookie, parseCookies } from "nookies";
import { createContext, ReactNode, useState, useEffect } from "react";
import { api } from "../services/apiClient";
import { toast } from 'react-toastify';



type AuthContextData = {
    user: UserProps;
    isAuthenticated:boolean;
    signIn: (credentials: SignInPropos) => Promise<void>;
    signOut: () => void;
    signUp: (credentials: SignUpProps) => Promise<void>;
}

type UserProps = {
    id: string;
    name: string;
    email: string;
}

type SignInPropos = {
    email: string;
    password:string;
}
type SignUpProps = {
    name: string;
    email: string;
    password:string;
}

type AuthProviderProps = {
    children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextData)

export function signOut(){
    try{
        destroyCookie(undefined, '@nextauth.token')
        Router.push('/')
    }catch{
        console.log('Erro ao deslogar')
        //toast.error('Erro ao deslogar')
    }
}

export function AuthProvider({children}: AuthProviderProps){
    
    const[user, setUser] = useState<UserProps>()

    const isAuthenticated = !!user //se etiver vazio fica falso

    useEffect(() => {
        //tenta pegar algo no cookie
        const {'@nextauth.token':token} = parseCookies()

        if(token){
            api.get('/me').then(response =>{
                const {id, name, email} = response.data

                setUser({
                    id,
                    name,
                    email
                })
            })
            .catch(() =>{
                //se deu erro, deslogamos o user.
                signOut();
            })
        }
    },[])
    
    async function signIn({email, password}:SignInPropos){
        //console.log('login', email)
       //console.log('senha', password)
    
    try{
        const response = await api.post('/session',{
            email,
            password
        })
        //  console.log(response.data) 

        const {id, name, token } = response.data

        setCookie(undefined,'@nextauth.token', token, { 
            maxAge: 60*60*24*30, //Recomendação da bilbioteca - 1 mês expira
            path: "/" //quais caminhos terão acesso ao cookie / significa todos
        })
        
        setUser({
            id,
            name,
            email,
        })

        //Passar para as próximas requisições o nosso token
        api.defaults.headers['Authorization'] = `Bearer ${token}`

        toast.success('Logado com sucesso!')

        //Logar e encaminhar para a página de pedidos /dashboards
        Router.push('/dashboard')
        
       }catch(err){
           // toast.error('Erro ao acessar')
            console.log('Erro ao acessar', err)
       }
       

    }

    async function signUp({name, email, password}:SignUpProps){
        //console.log(name)
        try{

            const response = await api.post('/users',{
                name,
                email,
                password
            })

            //console.log('Cadastro realizado!')
            toast.success('Cadastro realizado!')

            Router.push('/') //Redireciona para página de Login

        }catch(err){
            toast.error('Erro ao cadastrar')
            console.log('Erro ao cadastrar', err)
        }

    }




    return(
        <AuthContext.Provider value={{user, isAuthenticated, signIn, signOut, signUp }}>
            {children}
        </AuthContext.Provider>
    )
}