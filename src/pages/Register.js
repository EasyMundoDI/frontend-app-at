import React, { useRef } from 'react'
import {useHistory} from 'react-router-dom'
import Input from '../components/MyInputs'
import { Form } from '@unform/web'
import * as Yup from 'yup'
import api from '../services/api'




function SignIn() {
  const formRef = useRef(null)
  const history = useHistory()
  async function onSubmit(data, { reset }) {
    try {
      const Schema = Yup.object().shape({
        nome: Yup.string().required('O nome é obrigatório'),
        email: Yup.string().email('Digite um e-mail válido').required('O e-mail é obrigatório'),
        cpf: Yup.string().required('O cpf é obrigatório'),
        password: Yup.string().min(5, 'No mínimo 6 caracteres').required('A senha é obrigatória'),
        password2: Yup.string().oneOf([data.password], 'As senhas não correspondem')
        .required('É necessária a confirmação da senha'),
        numero: Yup.string().matches(phoneRegExp,'O número de telefone inválido tente novamente').required('O número de telefone é inválido').max(11, 'O número de telefone é inválido')
      })
      await Schema.validate(data, {
        abortEarly: false
      })
      api.post('/register', {
        nome: data.nome,
        email: data.email,
        password: data.password,
        cpf: data.cpf,
        number:data.numero
        
      }).then(result => {
        console.log(result)
        history.push('/signin')
      }).catch(fail => {
        console.log(fail)
      })
      reset()
      
       
      
      
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const errorMessages = {}
        err.inner.forEach(err => {
          errorMessages[err.path] = err.message
        })
        formRef.current.setErrors(errorMessages)
      }
    }

  }
  const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/
 
  return (
    <div>
    <section className="form-section">
      <h1>cadastre-se</h1>
      <div className="form-wrapper" >
        <Form onSubmit={onSubmit} ref={formRef} >
          <div className="input-block">
            <label>Nome</label>
              <Input name='nome' type="text"/>
          </div>
          <div className="input-block">
            <label>Email</label>
              <Input name='email' type="email"/>
          </div>
          <div className="input-block">
            <label>Cpf</label>
              <Input name='cpf' type="text"/>
          </div>
          <div className="input-block">
            <label>Número do Telefone</label>
            <Input name='numero' type='number'/>
          </div>
          <div className="input-block">
            <label>Senha</label>
            <Input name='password' type="password"/>
          </div>
          <div className="input-block">
            <label>Digite novamente a senha</label>
            <Input name='password2' type="password"/>
          </div>
          <button type='submit'className="btn-login">Login</button>
        </Form>
      </div>
    </section>
    </div>
  )
}

export default SignIn