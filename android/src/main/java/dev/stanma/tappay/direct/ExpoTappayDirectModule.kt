package dev.stanma.tappay.direct

import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import tech.cherri.tpdirect.api.TPDCard
import tech.cherri.tpdirect.api.TPDServerType
import tech.cherri.tpdirect.api.TPDSetup
import java.util.logging.Level
import java.util.logging.Logger

class ExpoTappayDirectModule : Module() {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.

  private var cardNumber: String = "";
  private var cardDueMonth: String = "";
  private var cardDueYear: String = "";
  private var cardCCV: String = "";

  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('ExpoTappayDirect')` in JavaScript.
    Name("ExpoTappayDirect")

    Function("getTheme") {
      return@Function "system"
    }

    Function("setup") { appId: Int, appKey: String, env: String ->
      val serverType = when (env) {
        "sandbox" -> TPDServerType.Sandbox
        "production" -> TPDServerType.Production
        else -> TPDServerType.Sandbox
      }

      TPDSetup.initInstance(
        appContext.reactContext,
        appId,
        appKey,
        serverType,
      )
    }

    Function("setCard") { number: String, dueMonth: String, dueYear: String, ccv: String ->
      cardNumber = number
      cardDueMonth = dueMonth
      cardDueYear = dueYear
      cardCCV = ccv

      TPDCard(
        appContext.reactContext,
        StringBuffer(cardNumber),
        StringBuffer(cardDueMonth),
        StringBuffer(cardDueYear),
        StringBuffer(cardCCV),
      )
    }

    Function("removeCard") {
      cardNumber = ""
      cardDueMonth = ""
      cardDueYear = ""
      cardCCV = ""

      return@Function true
    }

    AsyncFunction("getPrime") { promise: Promise ->
      try {
        TPDCard(
          appContext.reactContext,
          StringBuffer(cardNumber),
          StringBuffer(cardDueMonth),
          StringBuffer(cardDueYear),
          StringBuffer(cardCCV),
        )
          .onSuccessCallback { prime, cardInfo, cardIdentifier, _ ->
            val primeData = mapOf(
              "prime" to prime,
              "binCode" to cardInfo.bincode,
              "lastFour" to cardInfo.lastFour,
              "issuer" to cardInfo.issuer,
              "type" to cardInfo.cardType,
              "funding" to cardInfo.funding,
              "cardIdentifier" to cardIdentifier
            )

            promise.resolve(primeData)
          }
          .onFailureCallback { status, reportMsg ->
            promise.reject(status.toString(), reportMsg, Exception(reportMsg))
          }
          .createToken("UNKNOWN")
      }catch (e: Exception) {
        promise.reject("ERROR", e.message, e)
      }
    }
  }
}
