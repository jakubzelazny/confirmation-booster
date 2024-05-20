const emailProviders = [
  {
    name: "Gmail",
    domains: ["gmail.com"],
    mxRecordsSubstrings: ["google.com"],
    iconPath: "./icons/gmail.png",
    url: () => {
      return "https://mail.google.com"
    },
  },
  {
    name: "Outlook",
    domains: ["outlook.com", "hotmail.com", "live.com"],
    mxRecordsSubstrings: ["outlook.com"],
    url: () => {
      return "https://outlook.live.com"
    },
  },
]

window._confirmationBoosterData = {}

window._confirmationBoosterData.emailSubmitted = false
window._confirmationBoosterData.emailAddress = null

function generateButton(options) {
  return `
    <a href="${options.url}" target="_blank"
    style="display: flex; align-items: center; border-radius: 8px; border: #6b7280 1px solid; padding: 8px 32px; font-size: 16px; font-weight: 600; text-decoration: none; color: #111827;">
    <img src="${options.iconPath}" height="20" style="height: 20px;" />
    <div style="margin: 0 0 0 8px; ">Open ${options.name}</div>
  </a>
  `
}

const buttonsHTML = (options) => {
  let finalHTML = ""
  if (options.provider) {
    finalHTML += generateButton({
      url: options.provider.url(),
      name: options.provider.name,
      iconPath: options.provider.iconPath,
    })
  }

  if (options.platform === "macos" || options.platform === "ios") {
    finalHTML += generateButton({
      url: "message://",
      name: "Apple Mail",
      iconPath: "./icons/apple.png",
    })
  }

  return finalHTML
}

async function checkEmailProvider(email) {
  console.log(email)
  const domain = email.split("@")[1]
  let provider = emailProviders.find((provider) => {
    return provider.domains.includes(domain)
  })

  if (!provider) {
    const mxRecords = await fetchMXRecords(domain)
    if (mxRecords == null) {
      return null
    }
    provider = emailProviders.find((provider) => {
      return mxRecords.some((record) => {
        return provider.mxRecordsSubstrings.some((substring) => {
          return record.data.includes(substring)
        })
      })
    })
  }

  return provider
}

async function fetchMXRecords(domain) {
  let response = await fetch(
    `https://cloudflare-dns.com/dns-query?name=${domain}&type=MX`,
    { headers: { accept: "application/dns-json" } }
  )

  const data = await response.json()
  console.log(data.Answer)

  return data.Answer
}

function getPlatform() {
  const macosPlatforms = /(macintosh|macintel|macppc|mac68k|macos)/i
  const windowsPlatforms = /(win32|win64|windows|wince)/i
  const iosPlatforms = /(iphone|ipad|ipod)/i
  const linuxPlatforms = /(linux)/i
  const androidPlatforms = /(android)/i

  const platformName = navigator.platform.toLowerCase()

  if (macosPlatforms.test(platformName)) {
    return "macos"
  } else if (iosPlatforms.test(platformName)) {
    return "ios"
  } else if (windowsPlatforms.test(platformName)) {
    return "windows"
  } else if (linuxPlatforms.test(platformName)) {
    return "linux"
  } else if (androidPlatforms.test(platformName)) {
    return "android"
  }
}

async function testScript(data) {
  testDeleteForm()
  testAddSuccessElement()
  console.log("test")
  console.log(data)

  window._confirmationBoosterData.emailAddress = data.email
}

function configureSetup(options) {
  console.log(options)
  window.confirmationSetup = options
}

window.checkEmailProvider = checkEmailProvider
window.fetchMXRecords = fetchMXRecords
window.getPlatform = getPlatform
window.testScript = testScript

window.confirmationSetup = null
window.configureSetup = configureSetup

// Select the target element with a specific query

function watchForDisappear() {
  const targetElement = document.querySelector(
    ".formkit-input[name='email_address']"
  )

  const observer = new MutationObserver((records, observer) => {
    console.log("INSIDE NEW observe")
    console.log(records)
    if (
      window._confirmationBoosterData.emailSubmitted &&
      document.querySelector(".formkit-alert.formkit-alert-success")
    ) {
      console.log(records)
      console.log("----")
      console.log("NOT FOUND and submitted")

      mainSomething()
      observer.disconnect()
    }
  })

  console.log(observer)
  // Start observing mutations on the document
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })

  return null
}

function watchEmailInput() {
  const emailInput = document.querySelector(
    ".formkit-input[name='email_address']"
  )

  if (emailInput) {
    window._confirmationBoosterData.emailInput = emailInput
  }

  const observer = new MutationObserver((records, observer) => {
    // console.log(observer)

    if (
      !window._confirmationBoosterData.emailSubmitted &&
      document.querySelector(".formkit-input[name='email_address']")
    ) {
      console.log(records)
      console.log("FOUND and not submitted")

      window._confirmationBoosterData.emailInput = document.querySelector(
        ".formkit-input[name='email_address']"
      )

      observer.disconnect()
    }
  })

  console.log(observer)
  // Start observing mutations on the document
  observer.observe(document.body, { childList: true, subtree: true })

  return null
}
const targetElement = document.querySelector(
  ".formkit-input[name='email_address']"
)

function watchNewsletterSubmitButton() {
  const submitButton = document.querySelector(
    "button[data-element='submit'].formkit-submit"
  )

  if (submitButton) {
    window._confirmationBoosterData.submitButton = submitButton
    window._confirmationBoosterData.submitButton.addEventListener(
      "click",
      () => {
        const email = window._confirmationBoosterData.emailInput.value
        testScript({ email })
      }
    )
  }

  const observer = new MutationObserver((records, observer) => {
    console.log(records)
    console.log(observer)

    if (
      document.querySelector("button[data-element='submit'].formkit-submit")
    ) {
      console.log("FOUND")

      window._confirmationBoosterData.submitButton = document
        .querySelector("button[data-element='submit'].formkit-submit")
        .addEventListener("click", () => {
          const email = window._confirmationBoosterData.emailInput.value
          window._confirmationBoosterData.emailSubmitted = true
          // testScript({ email })
        })

      observer.disconnect()
    }
  })

  console.log(observer)
  // Start observing mutations on the document
  observer.observe(document.body, { childList: true, subtree: true })

  return null
}

watchEmailInput()
watchNewsletterSubmitButton()
watchForDisappear()

// document.addEventListener("DOMContentLoaded", () => {
//   console.log(document.querySelector(".formkit-input"))
//   console.log(document.querySelector(".formkit-input[name='email_address']"))
//   // document.querySelector(window.confirmationSetup.email_query)

//   document.querySelector("button").addEventListener("click", () => {
//     const email = document.getElementById("email").value
//     testScript({ email })
//   })
// })

// document.getElementById("output").innerHTML = generateButton({
//   url: "https://mail.google.com",
//   name: "Mail",
//   iconPath: "./icons/apple.png",
// })

function testDeleteForm() {
  console.log(document.querySelector("#form"))
  document.querySelector("#form").remove()
}

function testAddSuccessElement() {
  const successElement = document.createElement("div")
  successElement.classList.add("formkit-alert")
  successElement.classList.add("formkit-alert-success")
  successElement.innerHTML = "Success"
  document.body.appendChild(successElement)
}

function mainSomething() {
  console.log("Starting")
  const start = Date.now()
  console.log(start)
  checkEmailProvider(window._confirmationBoosterData.emailAddress).then(
    (provider) => {
      console.log(window._confirmationBoosterData.emailAddress)
      console.log("HERE")
      console.log(provider)
      document.getElementById("output").innerHTML = buttonsHTML({
        provider: provider,
        platform: getPlatform(),
      })
      console.log(start - Date.now())
    }
  )
}
