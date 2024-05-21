function testAddSuccessElement() {
  const successElement = document.createElement("div")
  successElement.classList.add("formkit-alert")
  successElement.classList.add("formkit-alert-success")
  successElement.innerHTML = "Success"
  document.body.appendChild(successElement)
}

function testDeleteForm() {
  document.querySelector("#form").remove()
}

export { testAddSuccessElement, testDeleteForm }
