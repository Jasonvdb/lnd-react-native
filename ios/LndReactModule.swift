//
//  LndReactModule.swift
//  LightningTest
//
//  Created by Jason van den Berg on 2020/11/21.
//

import Foundation

@objc(LndReactModule)
class LndReactModule: NSObject {
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  @objc
  func test(_ network: NSString) {
    print(network)
  }
  
  @objc
  func walletExists(_ network: NSString, resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    let exists = false
    resolve(exists)
  }
  
  @objc
  func start(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
//    let args = "--lnddir=\(storage.path)"
//
//    print(args)
//    
//    LndmobileStart(
//        args,
//        LndEmptyResponseCallback { (error) in
//            completion(error)
//            
//            if error == nil {
//                EventBus.postToMainThread(.lndStarted)
//            }
//        },
//        LndEmptyResponseCallback { (error) in
//            onRpcReady(error)
//            
//            if error == nil {
//                EventBus.postToMainThread(.lndRpcReady)
//            }
//        }
//    )
  }
  
}

