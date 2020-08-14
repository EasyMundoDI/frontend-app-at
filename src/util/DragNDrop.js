function DragNDrop() {
  /* button adicionar */
  document.getElementById("adicionar").disabled = true;
  /* button adicionar */

  var cards;
  const dropzones = document.querySelectorAll(".container-dropzone");
  const main = document.getElementById("main");
  var observer = new MutationObserver(function (mutations) {
    cards = document.querySelectorAll(".cards-dropzone");
    cards.forEach((card, i) => {
      card.addEventListener("dragstart", dragstart);
      card.addEventListener("drag", drag);
      card.addEventListener("dragend", dragend);
    });
    const node = document.querySelectorAll(".cards-dropzone");
    var img = document.querySelectorAll("img-dropzone");
    if (cards.length >= 8) {
      /* button adicionar */
      document.getElementById("adicionar").disabled = true;
      /* button adicionar */
    } else if (cards.length <= 8) {
      /* button adicionar */
      document.getElementById("adicionar").disabled = false;
      /* button adicionar */
    }

    if (cards.length >= 1) {
      /* button enviar */
      document.getElementById("enviar").disabled = false;
      /* button enviar */
    }
    if (cards.length < 1) {
      /* button enviar */
      document.getElementById("enviar").disabled = true;
      /* button enviar */
    }
  });

  var config = { attributes: true, childList: true, characterData: true };
  observer.observe(main, config);

  function dragstart() {
    dropzones.forEach((dropzone) => {
      dropzone.classList.add("highlights");
    });
    this.classList.add("is-dragging");
  }
  function drag() {}
  function dragend() {
    dropzones.forEach((dropzone) => {
      dropzone.classList.remove("highlights");
    });
    this.classList.remove("is-dragging");
  }
  function dragenter() {}
  function dragover() {
    this.classList.add("over");
    const cardDragging = document.querySelector(".is-dragging");
    this.appendChild(cardDragging);
  }
  function dragleave() {
    this.classList.remove("over");
  }
  function drop() {
    this.classList.remove("over");
  }

  dropzones.forEach((dropzone) => {
    dropzone.addEventListener("dragenter", dragenter);
    dropzone.addEventListener("dragover", dragover);
    dropzone.addEventListener("dragleave", dragleave);
    dropzone.addEventListener("drop", drop);
  });
}
export default DragNDrop;
