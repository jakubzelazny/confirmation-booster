function testAddSuccessElement() {
  const successElement = document.createElement("div")
  successElement.classList.add("formkit-alert")
  successElement.classList.add("formkit-alert-success")
  successElement.innerHTML = "Success"
  document.body.appendChild(successElement)
}

function testDeleteForm() {
  if (document.querySelector("#form")) {
    document.querySelector("#form").remove()
    testAddSuccessElement()
  }
}

function testAddSuccessListener() {
  const button = document.querySelector(
    window._confirmationBoosterData.submitButtonSelector
  )
  if (button) {
    button.addEventListener("click", () => {
      testDeleteForm()
    })
  }
}

export { testAddSuccessElement, testDeleteForm, testAddSuccessListener }
