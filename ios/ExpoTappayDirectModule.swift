import ExpoModulesCore
import TPDirect

public class ExpoTappayDirectModule: Module {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
    
    
  private var tpdCard: TPDCard?
    
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('ExpoTappayDirect')` in JavaScript.
    Name("ExpoTappayDirect")

    Function("getTheme") { () -> String in
      "system"
    }
      
    Function("setup") { (appId: Int32, appKey: String, serverType: String) -> Void in
      let serverType: TPDServerType = (serverType == "production") ? .production : .sandBox
      TPDSetup.setWithAppId(appId, withAppKey: appKey, with: serverType)
    }
      
    Function("setCard") { (cardNumber: String, dueMonth: String, dueYear: String, ccv: String) -> Void in
      self.tpdCard = TPDCard.setWithCardNumber(cardNumber, withDueMonth: dueMonth, withDueYear: dueYear, withCCV: ccv)
    }
      
    Function("removeCard") { () -> Void in
      self.tpdCard = nil
    }
      
    AsyncFunction("getPrime") { (promise: Promise) in
      if let tpdCard = self.tpdCard {
        tpdCard
            .onSuccessCallback{ (prime, cardInfo, cardIdentifier, merchantReferenceInfo) in
              if
                  let directPayPrime = prime, directPayPrime != "",
                  let creditCardInfo = cardInfo,
                  let creditCardIdentifier = cardIdentifier
              {
                  promise.resolve([
                      "prime": directPayPrime,
                      "binCode": creditCardInfo.bincode ?? "",
                      "lastFour": creditCardInfo.lastFour ?? "",
                      "issuer": creditCardInfo.issuer ?? "",
                      "type": creditCardInfo.cardType,
                      "funding": creditCardInfo.funding,
                      "cardIdentifier": creditCardIdentifier
                  ])
              } else {
                  promise.reject("NO_PRIME", "PRIME IS EMPTY")
              }
            }
            .onFailureCallback{ (status, message) in
              promise.reject(String(status), message)
            }
            .createToken(withGeoLocation: "UNKNOWN")
      } else {
          promise.reject("NO_CARD", "PLEASE SET CARD FIRST")
      }
    }
  }
}
