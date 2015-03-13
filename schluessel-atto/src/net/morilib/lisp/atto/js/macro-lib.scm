;;;
;;; Copyright 2009-2014 Yuichiro Moriguchi
;;; 
;;; Licensed under the Apache License, Version 2.0 (the "License");
;;; you may not use this file except in compliance with the License.
;;; You may obtain a copy of the License at
;;; 
;;;     http://www.apache.org/licenses/LICENSE-2.0
;;; 
;;; Unless required by applicable law or agreed to in writing, software
;;; distributed under the License is distributed on an "AS IS" BASIS,
;;; WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
;;; See the License for the specific language governing permissions and
;;; limitations under the License.

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
; end