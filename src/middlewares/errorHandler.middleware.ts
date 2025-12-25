import { Request, Response } from "express"

class CustomError extends Error{
  statusCode:number
  
  constructor(message:string,statusCode:number){
    super(message)
    this.statusCode = statusCode
    Error.captureStackTrace(this,CustomError)
  }
}


export const errorHandler = async(err:any,req:Request,res:Response)=>{
  const message = err?.message || "Internal Server Error"
  const statusCode  = err?.stausCode || 500

  res.status(statusCode).json({
    message,
    data:null
  })
}