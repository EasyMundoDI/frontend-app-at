import LacunaWebPki from 'web-pki'


var webPki = (function () {
  var pki = new LacunaWebPki('')
  async function loadCertificate() {

    pki.init({
      ready: start,
      notInstalled:notInstalled
      
    })
    function start() {
      pki.listCertificates({
        selectId: 'certificateSelect',

      })

    }
  
    function notInstalled() {
      alert('você está sendo redirecionado para a pá de instalação do plugin')
      pki.redirectToInstallPage()
    }
  }
  loadCertificate()



})
export default webPki






