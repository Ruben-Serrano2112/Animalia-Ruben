package com.animalia.spring.Excepciones;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonFormat.Shape;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;


@Setter @Getter
@RequiredArgsConstructor
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiError {

	@NonNull
	private HttpStatus estado;
	
	//Personaliza la forma en que se formatea la variable al serializarse
	@Builder.Default
	@JsonFormat(shape = Shape.STRING, pattern="dd/MM/yyyy hh:mm:ss")
	private LocalDateTime fecha = LocalDateTime.now();
	
	@NonNull
	private String mensaje;
}
