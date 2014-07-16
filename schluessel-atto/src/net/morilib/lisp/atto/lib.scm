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

; lib
(define caar (lambda (x) (car (car x))))
(define cadr (lambda (x) (car (cdr x))))
(define cdar (lambda (x) (cdr (car x))))
(define cddr (lambda (x) (cdr (cdr x))))
(define caaar (lambda (x) (car (caar x))))
(define caadr (lambda (x) (car (cadr x))))
(define cadar (lambda (x) (car (cdar x))))
(define caddr (lambda (x) (car (cddr x))))
(define cdaar (lambda (x) (cdr (caar x))))
(define cdadr (lambda (x) (cdr (cadr x))))
(define cddar (lambda (x) (cdr (cdar x))))
(define cdddr (lambda (x) (cdr (cddr x))))
(define caaaar (lambda (x) (car (caaar x))))
(define caaadr (lambda (x) (car (caadr x))))
(define caadar (lambda (x) (car (cadar x))))
(define caaddr (lambda (x) (car (caddr x))))
(define cadaar (lambda (x) (car (cdaar x))))
(define cadadr (lambda (x) (car (cdadr x))))
(define caddar (lambda (x) (car (cddar x))))
(define cadddr (lambda (x) (car (cdddr x))))
(define cdaaar (lambda (x) (cdr (caaar x))))
(define cdaadr (lambda (x) (cdr (caadr x))))
(define cdadar (lambda (x) (cdr (cadar x))))
(define cdaddr (lambda (x) (cdr (caddr x))))
(define cddaar (lambda (x) (cdr (cdaar x))))
(define cddadr (lambda (x) (cdr (cdadr x))))
(define cdddar (lambda (x) (cdr (cddar x))))
(define cddddr (lambda (x) (cdr (cdddr x))))

(define not (lambda (x) (if x #f #t)))
(define boolean? (lambda (x) (or (eq? x #t) (eq? x #f))))
(define pair? (lambda (x) (if (null? x) #f (if (atom? x) #f #t))))

(define equal? (lambda (x y)
  (define (vector-equal? x y i)
    (cond ((= (vector-length x) i) #t)
          ((not (equal? (vector-ref x i) (vector-ref y i))) #f)
          (else (vector-equal? x y (+ i 1)))))
  (cond ((eqv? x y) #t)
        ((pair? x)
          (and (pair? y)
               (equal? (car x) (car y))
               (equal? (cdr x) (cdr y))))
        ((string? x) (and (string? y) (string=? x y)))
        ((vector? x)
          (and (vector? y)
               (= (vector-length x) (vector-length y))
               (vector-equal? x y 0)))
        (else #f))))

(define member (lambda (x lis)
  (cond ((null? lis) #f)
        ((equal? x (car lis)) lis)
        (else (member x (cdr lis))))))

(define assq (lambda (x lis)
  (cond ((null? lis) #f)
        ((not (pair? (car lis)))
          (error (get-default-message 'err.require.pair)))
        ((eq? (caar lis) x) (car lis))
        (else (assq x (cdr lis))))))

(define assv (lambda (x lis)
  (cond ((null? lis) #f)
        ((not (pair? (car lis)))
          (error (get-default-message 'err.require.pair)))
        ((eqv? (caar lis) x) (car lis))
        (else (assv x (cdr lis))))))

(define assoc (lambda (x lis)
  (cond ((null? lis) #f)
        ((not (pair? (car lis)))
          (error (get-default-message 'err.require.pair)))
        ((equal? (caar lis) x) (car lis))
        (else (assoc x (cdr lis))))))

; list
(define list (lambda l
  (let lp ((l l))
    (if (null? l)
        '()
        (cons (car l) (lp (cdr l)))))))

(define length (lambda (l)
  (let lp ((l l) (r 0))
    (if (null? l)
        r
        (lp (cdr l) (1+ r))))))

(define list-ref (lambda (l n)
  (if (< n 0) (error "list-ref"))
  (cond ((not (pair? l)) (error "list-ref"))
        ((<= n 0) (car l))
        (else (list-ref (cdr l) (- n 1))))))

(define list-tail (lambda (l n)
  (if (< n 0) (error "list-tail"))
  (cond ((<= n 0) l)
        ((not (pair? l)) (error "list-tail"))
        (else (list-tail (cdr l) (- n 1))))))

(define list->string (lambda (l)
  (cond ((null? l) "")
        (else (string-append (->string (car l))
                             (list->string (cdr l)))))))

(define append (lambda l
  (let lp1 ((l l))
    (cond ((null? l) '())
          ((null? (cdr l)) (car l))
          (else
            (let lp2 ((m (car l)))
              (if (null? m)
                  (lp1 (cdr l))
                  (cons (car m) (lp2 (cdr m))))))))))

(define reverse (lambda (l)
  (if (pair? l)
      (let lp ((l l) (r '()))
        (if (null? l)
            r
            (lp (cdr l) (cons (car l) r))))
      l)))

(define memq (lambda (o l)
  (cond ((null? l) #f)
        ((eq? o (car l)) l)
        (else (memq o (cdr l))))))

(define memv (lambda (o l)
  (cond ((null? l) #f)
        ((eqv? o (car l)) l)
        (else (memq o (cdr l))))))

(define list? (lambda (l)
  (let lp ((l l) (c '()))
    (cond ((null? l) #t)
          ((memq l c) #f)
          ((pair? l) (lp (cdr l) (cons l c)))
          (else #f)))))

; map
(define map (lambda (p . l1)
  (define cx (lambda (p l2)
    (let l1 ((l l2))
      (if (null? l)
          '()
          (cons (p (car l)) (l1 (cdr l)))))))
  (define n? (lambda (l2)
    (let l1 ((l l2))
      (cond ((null? l) #f)
            ((null? (car l)) #t)
            (else (l1 (cdr l)))))))
  (let l0 ((l l1))
    (if (n? l)
        '()
        (cons (apply p (cx car l)) (l0 (cx cdr l)))))))

(define for-each (lambda (p . l1)
  (define cx (lambda (p l2)
    (let l1 ((l l2))
      (if (null? l)
          '()
          (cons (p (car l)) (l1 (cdr l)))))))
  (define n? (lambda (l2)
    (let l1 ((l l2))
      (cond ((null? l) #f)
            ((null? (car l)) #t)
            (else (l1 (cdr l)))))))
  (let l0 ((l l1))
    (if (n? l)
        '()
        (begin
           (apply p (cx car l))
           (l0 (cx cdr l)))))))

; end