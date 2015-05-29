;;;
;;; Copyright (c) 2015, Yuichiro MORIGUCHI
;;; All rights reserved.
;;; 
;;; Redistribution and use in source and binary forms, with or without
;;; modification, are permitted provided that the following conditions are met:
;;; * Redistributions of source code must retain the above copyright notice, 
;;;   this list of conditions and the following disclaimer.
;;; * Redistributions in binary form must reproduce the above copyright notice, 
;;;   this list of conditions and the following disclaimer in the documentation 
;;;   and/or other materials provided with the distribution.
;;; * Neither the name of the Yuichiro MORIGUCHI nor the names of its contributors 
;;;   may be used to endorse or promote products derived from this software 
;;;   without specific prior written permission.
;;; 
;;; THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
;;; ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
;;; WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
;;; DISCLAIMED. IN NO EVENT SHALL Yuichiro MORIGUCHI BE LIABLE FOR ANY
;;; DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
;;; (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
;;; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
;;; ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
;;; (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
;;; SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

; syntax
(define-syntax and
  (syntax-rules ()
    ((_) #t)
    ((_ e1) e1)
    ((_ e1 e2 ...) (if e1 (and e2 ...) #f))))

(define-syntax or
  (syntax-rules ()
    ((_) #f)
    ((_ e1) e1)
    ((_ e1 e2 ...)
       (let ((x e1))
         (if x x (or e2 ...))))))

(define-syntax cond
  (syntax-rules (else =>)
    ((_ (else r1 r2 ...)) (begin r1 r2 ...))
    ((_ (cd => r1))
      (let ((tm cd)) (if tm (r1 tm))))
    ((_ (cd => r1) c1 c2 ...)
      (let ((tm cd))
        (if tm
            (r1 tm)
            (cond c1 c2 ...))))
    ((_ (cd)) test)
    ((_ (cd) c1 c2 ...)
      (let ((tm cd))
        (if tm tm (cond c1 c2 ...))))
    ((_ (cd r1 r2 ...))
      (if cd (begin r1 r2 ...)))
    ((_ (cd r1 r2 ...) c1 c2 ...)
      (if cd
          (begin r1 r2 ...)
          (cond c1 c2 ...)))))

(define-syntax case
  (syntax-rules (else)
    ((case (key ...) cs ...)
      (let ((ak (key ...)))
        (case ak cs ...)))
    ((case key (else r1 ...)) (begin r1 ...))
    ((case key ((atoms ...) r1 ...))
      (if (memv key '(atoms ...))
          (begin r1 ...)))
    ((case key ((atoms ...) r1 ...) cl ...)
      (if (memv key '(atoms ...))
          (begin r1 ...)
          (case key cl ...)))))

(define-syntax let
  (syntax-rules ()
    ((let ((name val) ...)) (if #f #f))
    ((let ((name val) ...) body1 body2 ...)
      ((lambda (name ...) body1 body2 ...)
         val ...))
    ((let tag ((name val) ...) body1 body2 ...)
      ((let ((tag (if #f #f)))
        (set! tag (lambda (name ...) body1 body2 ...))
        tag) val ...))))
;      ((letrec ((tag (lambda (name ...) body1 body2 ...))) tag)
;          val ...))))

(define-syntax let*
  (syntax-rules ()
    ((_ () e1 ...)
     (let () e1 ...))
    ((_ ((x1 v1) (x2 v2) ...) e1 ...)
     (let ((x1 v1))
       (let* ((x2 v2) ...) e1 ...)))))

(define-syntax ->
  (syntax-rules ()
    ((_ o (m args ...))
     (m o args ...))
    ((_ o (m args ...) a ...)
     (-> (m o args ...) a ...))))
; end