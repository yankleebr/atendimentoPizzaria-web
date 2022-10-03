

//função para páginas que só podem ser acessadas por visitantes

import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { parseCookies } from "nookies";

export function canSSRGuest <P> (fn:GetServerSideProps<P>){
     return async (ctx:GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> =>{

        const cookies = parseCookies(ctx)

        //Se tentar acessar a página e já tem um login salvo, é feito redirecionamento
   
        if(cookies['@nextauth.token']){
           return{
               redirect:{
                   destination: '/dashboard',
                   permanent: false,
               }
           }
        }
   
   
        return await fn(ctx)

     }

    
}