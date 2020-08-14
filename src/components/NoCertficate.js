import React, { useEffect, useContext,useState } from 'react'
import { Context } from '../Context/AuthContext'
import api from '../services/api'
import Modal from 'react-modal'
import LacunaWebPki from 'web-pki'
import { FaIdCard } from 'react-icons/fa'
import { MdCancel} from 'react-icons/md'
import $ from 'jquery'
import axios from 'axios'
import Moment from 'moment'



function NoCertificate() {

  const [cert, setCert] = useState()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)


  var subtitle
  const [modalIsOpen, setIsOpen] = React.useState(false)

  useEffect(() => {
    axios.all([
      api.get('/user/searchuser')
    ]).then(axios.spread( 
      (getUser) => {
        setUser(getUser.data)
        setLoading(false)
      }
    ))
  }, [])

  
  function openModal() {
    setIsOpen(true)
  }
  const pki = new LacunaWebPki('')
  function afterOpenModal() {

    async function loadcertificate() {
      pki.init({
        ready: start,
        notInstalled:notInstalled
        
      })
      function start() {
        pki.listCertificates().success((certificates) => {

          var select = $('#certificateSelect')
          function filterObj(obj) {
            if (obj.pkiBrazil.cpf === user.cpf) {
              return obj
            }
          }

          var filtered = certificates.filter(filterObj)
          console.log(filtered)
          $.each(filtered, function () {

            

              select.append(
                $('<option />')

                  
                  .text(this.subjectName + ' (issued by ' + Moment(this.validityStart).format() + ')')
            )

            

          })

        })
      }
  
      function notInstalled() {
        alert('você está sendo redirecionado para a página de instalação do plugin')
        pki.redirectToInstallPage()
      }
  
    }
    loadcertificate()

    subtitle.style.color = '#f00';
  }
  function closeModal(){
    setIsOpen(false);
  }
  function adicionarCert(certs) {


    console.log(certs)
    

      



  }





  return ( loading ? <div><h1>loading</h1></div> :
    
    <div>
        <Modal
          isOpen={modalIsOpen}
          onAfterOpen={afterOpenModal}
          onRequestClose={closeModal}
          className='Modal'
        >
        <h2 ref={_subtitle => (subtitle = _subtitle)}>adicionar certificado
        <button onClick={closeModal} className='buttonClose'><MdCancel className='iconCancel'/></button></h2>
          
        <select id="certificateSelect"></select>
        <button id='buttonAdicionar' onClick={()=>adicionarCert($('#certificateSelect').val())} >adicionar</button>

        </Modal>
    

      <div className='containerBody'>

      <FaIdCard className='iconCert'/>
      <p><strong>nenhum certificado utilizado ainda.</strong></p>
      <button onClick={()=>openModal()} className='mainButton'> <strong>adicionar certificado</strong> </button>

      </div>
    </div>
  )
}

export default NoCertificate;