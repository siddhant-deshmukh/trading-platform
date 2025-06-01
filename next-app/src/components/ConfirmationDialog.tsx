'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"  
import { Button } from "@/components/ui/button"
import { useState } from "react";

interface Props {
  variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined
  buttonText: string,
  dialogTitle: string,
  dialogDesc?: string,
  dialogSubmitBtnText?: string,
  dialogCancelBtnText?: string,
  postConfirmationFunction: any;
  postRejectionFunction: any;
}

export function ConfirmationDialog(props: Props) {
  const [loading, setLoading] = useState(false)
  const { buttonText, variant, dialogTitle, postConfirmationFunction, postRejectionFunction, dialogCancelBtnText, dialogDesc, dialogSubmitBtnText } = props;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variant?? 'outline'}>{buttonText}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
          {
            dialogDesc && 
            <AlertDialogDescription>
              {dialogDesc}
            </AlertDialogDescription>
          }
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={()=> {postRejectionFunction()}} >{ dialogCancelBtnText ? dialogCancelBtnText : 'Cancel' }</AlertDialogCancel>
          <AlertDialogAction 
            disabled={loading}
            onClick={()=> { setLoading(true); postConfirmationFunction()}} >{ dialogSubmitBtnText ? dialogSubmitBtnText : 'Confirm' }
            </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>    
  )
}  






export default ConfirmationDialog
