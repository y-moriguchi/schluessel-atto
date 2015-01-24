;;;
;;; Copyright 2009-2015 Yuichiro Moriguchi
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

(define *varno* 0)

(define <cont> (string->symbol "<cont>"))
(define <dummy> (string->symbol "<dummy>"))

(define newvar
  (lambda ()
    (set! *varno* (+ *varno* 1))
    (string->symbol (string-append "**" (number->string *varno*)))))

(define simple?
  (lambda (a)
    (cond ((atom? a) #t)
          ((null? a) #t)
          ((builtin? (car a)) (simple-list? (cdr a)))
          (else #f))))

(define simple-list?
  (lambda (a)
    (cond ((null? a) #t)
          ((atom? a) (error "list must be proper"))
          ((simple? (car a)) (simple-list? (cdr a)))
          (else #f))))

(define convert-simple
  (lambda (a k)
    (k (list <cont> a))))

(define convert-f-c
  (lambda (f c)
    (if (builtin? f) (list f) (cons f (list c)))))

(define convert-f2
  (lambda (v w c)
    (cond ((null? w) c)
          ((eq? (car w) <dummy>) (convert-f2 (cdr v) (cdr w) c))
          (else
            (convert-f2 (cdr v)
                        (cdr w)
                        (convert-s (car w)
                                   (list 'lambda (list (car v)) c)))))))

(define convert-f
  (lambda (f a v w c)
    (cond ((null? a) (convert-f2 v w (append (convert-f-c f c) (reverse v))))
          ((atom? a) (error "list must be proper"))
          ((simple? (car a))
            (convert-f f (cdr a) (cons (car a) v) (cons <dummy> w) c))
          ((and (not (null? (car a))) (eq? (caar a) 'lambda))
            (convert-f f (cdr a) (cons (convert-s (car a) c) v) (cons <dummy> w) c))
          (else
            (let ((t (newvar)))
              (convert-f f (cdr a) (cons t v) (cons (car a) w) c))))))

(define convert-if3
  (lambda (b a c)
    (list 'if
          b
          (convert-s (caddr a) c)
          (convert-s (cadddr a) c))))

(define convert-if2
  (lambda (a c)
    (if (simple? (cadr a))
        (convert-if3 (cadr a) a c)
        (let ((t (newvar)))
          (convert-s (cadr a)
                     (list 'lambda (list t) (convert-if3 t a c)))))))

(define convert-if
  (lambda (a c)
    (if (null? (cdddr a))
        (convert-if2 (cons a (list 'if #f #f)) c)
        (convert-if2 a c))))

(define convert-quote (lambda (a c) a))
(define convert-begin (lambda (a c) (convert-complex (cdr a) c)))
(define convert-define
  (lambda (a c)
    (cond ((null? (cadr a)) a)
          ((atom? (cadr a)) a)
          ((eq? (caadr a) 'lambda)
            (list 'define (cadr a) (convert-s (caddr a) c)))
          (else a))))

(define convert-lambda
  (lambda (a c)
    (list 'lambda (cons <cont> (cadr a)) (convert-complex (cddr a) c))))

(define convert-set!2
  (lambda (a c)
    (if (simple? (caddr a))
        (list 'set! (cadr a) (caddr a))
        (let ((t (newvar)))
          (convert-s (caddr a)
                     (list 'lambda (list t) (list 'set (cadr a) (caddr a))))))))

(define convert-complex
  (lambda (a c) (convert-complex2 a c (null? (cdr a)))))

(define convert-complex2
  (lambda (a c z)
    (cond ((null? a) c)
          (z
            (cond ((simple? (car a))    (convert-s (car a) c))
                  ((eq? (caar a) 'set!) (convert-set!2 a c))
                  (else                 (convert-s (car a) c))))
          ((simple? (car a)) (loop (cdr a) c))
          ((eq? (caar a) 'set!)
            (let ((t (newvar)))
              (convert-complex (cdr a)
                               (convert-set!2 (car a) c)
                               (null? (cdr a)))))
          (else (convert-complex (cdr a)
                                 (list 'lambda
                                       (list (newvar))
                                       (convert-s (car a) c)))
                                       (null? (cdr a))))))

(define convert-s
  (lambda (a c)
    (cond ((simple? a)           (list c a))
          ((eq? (car a) 'if)     (convert-if     a c))
          ((eq? (car a) 'quote)  (convert-quote  a c))
          ((eq? (car a) 'begin)  (convert-begin  a c))
          ((eq? (car a) 'define) (convert-define a c))
          ((eq? (car a) 'lambda) (convert-lambda a c))
          ((eq? (car a) 'set!)   (convert-set!2  a c))
          (else
            (convert-f (car a) (cdr a) '() '() c)))))

(define cps (lambda (a) (convert-s a <cont>)))

;